const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/items/";
const Item = require("../../src/db/models").Item;
const User = require("../../src/db/models").User;
const sequelize = require("../../src/db/models/index").sequelize;

describe("routes : items", () => {

  beforeEach((done) => {
    this.item;
    this.user;

    sequelize.sync({force: true}).then((res) => {
      User.create({
        name: "Example User",
        email: "user@example.com",
        password: "1234567890"
      })
      .then((user) => {
        this.user = user;

        Item.create({
          name: "celery"
        })
        .then((item) => {
          this.item = item;

          request.get({
            url: "http://localhost:3000/auth/fake",
            form: {
              userId: this.user.id,
              email: this.user.email
            }
          },
            (err, res, body) => {
              done();
            }
          )
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });
  });

  describe("GET /items", () => {

    it("should render a status code of 200 and list all items", (done) => {
      console.log("about to request /items")
      request.get(base, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        expect(body).toContain("celery");
        done();
      });
    });

  });

  describe("POST /items/create", () => {

    it("should create a new item and rerender", (done) => {
      const options = {
        url: `${base}create`,
        form: {
          name: "milk",
        }
      };
      request.post(options, (err, res, body) => {
        Item.findOne({where: {name: "milk"}})
        .then((item) => {
          expect(res.statusCode).toBe(303);
          expect(item.name).toBe("milk");
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });

    it("should not create a new item that fails validation", (done) => {
      const options = {
        url: `${base}create`,
        form: {
          name: "",
        }
      };
      request.post(options, (err, res, body) => {
        Item.findOne({where: {name: ""}})
        .then((item) => {
          expect(item).toBeNull();
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });

  });

});