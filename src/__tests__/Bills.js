/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import '@testing-library/jest-dom';
import BillsUI from "../views/BillsUI.js";
import mockStore from "../__mocks__/store.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import { formatDate } from "../app/format.js"


jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList).toContain("active-icon")

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    describe("When I click on an eye icon", () => {
      test("Then the image src inside the modal should change to the data-bill-url attribute of the clicked icon", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        // Renewing the Bills page
        document.body.innerHTML = ""
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)

        await waitFor(() => screen.getAllByTestId("icon-eye"))

        const icons = screen.getAllByTestId("icon-eye");

        for(let icon of icons)
        {
          userEvent.click(icon)
          let ticket = screen.getByTestId("bill-ticket");
          expect(ticket.getAttribute("src")).toEqual(icon.getAttribute("data-bill-url"))
        }

      })
    })
    describe("When I click on the new Bill button", () => {

      test("Then the new Bill page is loaded", async () => {

        await waitFor(() => screen.getAllByTestId("btn-new-bill"))

        const newBillBtn = screen.getByTestId("btn-new-bill")
        newBillBtn.click()

        await waitFor(() => screen.getByTestId("form-new-bill"))

        let form = screen.getByTestId("form-new-bill")
        expect(form).toBeTruthy()

      })

    })

  })
})
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {

      localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const bills = await mockStore.bills().list()

      for(let bill of bills)
      {
        await waitFor(() => screen.getByText(formatDate(bill["date"])))
        let formatted_date = screen.getByText(formatDate(bill["date"]))
        expect(formatted_date).toBeTruthy()

      }


    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()

      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
      test("show unformated date when data is corrupted", async() => {

        // Creating fake corrupted data
        mockStore.bills.mockImplementationOnce( () => {
          return {
            list : () =>  {
              return Promise.resolve([{
                "id": "47qAXb6fIm2zOKkLzMro",
                "vat": "80",
                "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                "status": "pending",
                "type": "Hôtel et logement",
                "commentary": "séminaire billed",
                "name": "encore",
                "fileName": "preview-facture-free-201801-pdf-1.jpg",
                "date": "date_error",
                "amount": 400,
                "commentAdmin": "ok",
                "email": "a@a",
                "pct": 20
              }])
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const unformated_date = await screen.getByText("date_error")
        expect(unformated_date).toBeTruthy()
      })
    })
  })
})
