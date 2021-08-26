// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

const Reservation = require("./models/reservation");

// app imports
const app = require("./app");
const db = require("./db");

let testCustomer;
let testReservation;

beforeEach(async () => {

    const result1 = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes) 
        VALUES ('testFirstName', 'testLastName', '9998887766', 'Test note') 
        RETURNING id, first_name AS "firstName", last_name AS "lastName", phone, notes`
    );
    testCustomer = result1.rows[0];

    const result2 = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes) 
        VALUES ('${testCustomer.id}', '2018-09-08 12:20:07', '2', 'some test note') 
        RETURNING id, customer_id AS "customerId", start_at AS "startAt", num_guests AS "numGuests", notes`
    );
    testReservation = result2.rows[0];

});

/** GET / and /:id/ - returns html tamplates */
describe("GET / and /:id/", () => {

    test("Gets a list of 1 customer", async () => {
      const response = await request(app).get(`/`);
      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain(testCustomer.firstName);
    });
    
    test("Gets a list of 1 customer and reservation", async () => {
        const reserv = new Reservation(testReservation);
        const response = await request(app).get(`/${testCustomer.id}`);
        expect(response.statusCode).toEqual(200);
        expect(response.text).toContain(testCustomer.firstName);
        expect(response.text).toContain(reserv.getformattedStartAt());
    });

});
// end


/** GET /top/ ten customers - returns html tamplate */
describe("GET /top/", () => {

    test("Gets a list of top customers", async () => {
      const response = await request(app).get(`/top/`);
      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain(testCustomer.firstName);
    });

});
// end


/** 
 * GET /add/ returns html add form tamplate, 
 * POST /add/ - create a new customer rederects to customer details page. 
 * */
describe("GET /add/ and POST /add/", () => {

    test("Gets a form to create a new customer", async () => {
        const response = await request(app).get(`/add/`);
        expect(response.statusCode).toEqual(200);
        expect(response.text).toContain(`<h1>Add a Customer</h1>`);
    });
  

    test("Creates a new customer", async () => {
      const response = await request(app)
        .post(`/add/`)
        .send({
          firstName: "firtsNameCustomer",
          lastName: "lastNameCustomer",
          phone: "1112223344",
          notes: "this second customer"
        })
        .redirects(1);
      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain(`<p><b>Notes: </b>this second customer</p>`);
    });

  });
// end


/** 
 * GET /:id/edit/ returns html edit form tamplate, 
 * POST /:id/eddit/ - changes data of the customer rederects to customer details page. 
 * */
 describe("GET /:id/edit/ and POST /:id/edit/", () => {

    test("Gets a form to update details of the customer", async () => {
        const response = await request(app).get(`/${testCustomer.id}/edit/`);
        expect(response.statusCode).toEqual(200);
        expect(response.text).toContain(`value="${testCustomer.firstName}"`);
    });
  

    test("Update customer details", async () => {
      const response = await request(app)
        .post(`/${testCustomer.id}/edit/`)
        .send({
          firstName: "updatedFirstNameCustomer",
          lastName: "udatedSecondNameCustomer",
          phone: "1112223344",
          notes: "this updated customer"
        })
        .redirects(1);
        
      testCustomer =  await db.query(`SELECT * FROM customers WHERE id = ${testCustomer.id}`);
      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain(`<p><b>Notes: </b>${testCustomer.rows[0].notes}</p>`);
    });

  });
// end


afterEach(async () => {
    // delete any data created by test
    await db.query("DELETE FROM reservations");
    await db.query("DELETE FROM customers");
});

afterAll(async () => {
    // close db connection
    await db.end();
});