/**
 * @jest-environment jsdom
 */

import {fireEvent, screen} from "@testing-library/dom"
import mockStore from "../__mocks__/store.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import {ROUTES_PATH} from "../constants/routes.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "fakemail@fake.com"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })
    afterEach(() => {
      // Clear spy between each test
      jest.clearAllMocks();
    })
    test("Then png files should be allowed in ticket", () => {

      const file_input = screen.getByTestId("file")
      const billsSpy = jest.spyOn(mockStore, "bills")

      let fake_name = 'fakefile.png'
      let fake_file = new File([""], fake_name, {type: 'image/png'})
      Object.defineProperty(fake_file, "size", {value:60 * 60 + 1, configurable : true})
      fireEvent.change(file_input, {target : {files: [fake_file]}})

      expect(billsSpy).toHaveBeenCalled()

    })
    test("Then jpeg files should be allowed in ticket", () => {

      const file_input = screen.getByTestId("file")
      const billsSpy = jest.spyOn(mockStore, "bills")

      let fake_name = 'fakefile.jpeg'
      let fake_file = new File([""], fake_name, {type: 'image/jpeg'})
      Object.defineProperty(fake_file, "size", {value:60 * 60 + 1, configurable : true})
      fireEvent.change(file_input, {target : {files: [fake_file]}})

      expect(billsSpy).toHaveBeenCalled()

    })
    test("Then jpg files should be allowed in ticket", () => {

      const file_input = screen.getByTestId("file")
      const billsSpy = jest.spyOn(mockStore, "bills")

      let fake_name = 'fakefile.jpg'
      let fake_file = new File([""], fake_name, {type: 'image/jpg'})
      Object.defineProperty(fake_file, "size", {value:60 * 60 + 1, configurable : true})
      fireEvent.change(file_input, {target : {files: [fake_file]}})

      expect(billsSpy).toHaveBeenCalled()

    })
    test("Then text format files should not be allowed in ticket", () => {

      const file_input = screen.getByTestId("file")
      const billsSpy = jest.spyOn(mockStore, "bills")

      let fake_name = 'fakefile.txt'
      let fake_file = new File([""], fake_name)
      Object.defineProperty(fake_file, "size", {value:60 * 60 + 1, configurable : true})
      fireEvent.change(file_input, {target : {files: [fake_file]}})

      const errorModal = screen.getByTestId("error-modal")

      expect(billsSpy).not.toHaveBeenCalled()
      expect(errorModal.innerHTML).toContain("Le formulaire n'accepte que les images")

    })
  })
  describe("When I POST a New Bill", () => {

    test("Then if update is successfull should redirect to Bills page", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "fakemail@fake.com"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      // Create Fake Data
      screen.getByTestId("expense-type").value = "Transport"
      screen.getByTestId("expense-name").value = "Fake Test Spending"
      screen.getByTestId("amount").value = "300"
      screen.getByTestId("datepicker").value = "2023-06-01"
      screen.getByTestId("vat").value = "20"
      screen.getByTestId("pct").value = "20"
      screen.getByTestId("commentary").value = "This is a fake bill for testing purpose"

      // Create the fake file to fill in file input
      const file_input = screen.getByTestId("file")
      let fake_name = 'fakefile.jpeg'
      let fake_file = new File([""], fake_name, {type: 'image/jpeg'})
      Object.defineProperty(fake_file, "size", {value:60 * 60 + 1, configurable : true})
      fireEvent.change(file_input, {target : {files: [fake_file]}})

      // Submit form
      let form = screen.getByTestId("form-new-bill")
      fireEvent.submit(form)

      // We wait for all promise to be finsihed
      await new Promise(process.nextTick);

      // We check if bills page is loaded
      let newBillsBtn = screen.getByTestId("btn-new-bill")
      expect(newBillsBtn).toBeTruthy()

    })

  })
})
