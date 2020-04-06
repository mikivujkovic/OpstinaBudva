const ViberBot = require("viber-bot").Bot;
const BotEvents = require("viber-bot").Events;
const express = require("express");
const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const Poruke = require("./poruke.js");
const Tastature = require("./tastature.js");

// Express server
const app = express();
app.use(cors());
app.listen(3000, "0.0.0.0");
console.log("start app");

const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

// Setup bota
const bot = new ViberBot({
  authToken: "4b4334bcea67dcbc-9ff7a04a4126cd5c-9fd8553714b16c60",
  name: "Opstina Budva",
  avatar: "https://ibb.co/dMGYHf5",
});
const TextMessage = require("viber-bot").Message.Text;
const RichMediaMessage = require("viber-bot").Message.RichMedia;

// operater state
const operater = [];

// Setup baze
var User;
var Admin;
var Pitanje;
var FAQ;

var sequelize = new Sequelize({
  // host: "0.0.0.0",
  dialect: "sqlite",
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  storage: "./data/database.sqlite",
});

// authenticate with the database
sequelize
  .authenticate()
  .then(function (err) {
    console.log("Connection has been established successfully.");
    User = sequelize.define("users", {
      viberId: {
        type: Sequelize.STRING,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
      },
    });
    User.sync();
    Admin = sequelize.define("admins", {
      username: {
        type: Sequelize.STRING,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
      },
    });
    Admin.sync();
    Pitanje = sequelize.define("pitanja", {
      viberId: {
        type: Sequelize.STRING,
      },
      pitanje: {
        type: Sequelize.STRING,
      },
      odgovor: {
        type: Sequelize.STRING,
      },
      kontakt: {
        type: Sequelize.STRING,
      },
      trajno: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      odgovoreno: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    });
    Pitanje.sync();
    FAQ = sequelize.define("faqs", {
      pitanje: {
        type: Sequelize.STRING,
      },
      odgovor: {
        type: Sequelize.STRING,
      },
      kontakt: {
        type: Sequelize.STRING,
      },
    });
    FAQ.sync();
  })
  .catch(function (err) {
    console.log("Unable to connect to the database: ", err);
  });

// Poruke
const pocetnaPoruka = new TextMessage(
  Poruke.pocetnaPoruka,
  Tastature.pocetnaTastatura()
);

// Bot reakcije na poruke
bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {
  const userId = response.userProfile.id;
  const userName = response.userProfile.name;
  const tekstPoruke = message.text;

  switch (tekstPoruke.toLowerCase()) {
    case "kontakt":
      bot.sendMessage(
        { id: userId },
        new TextMessage(
          "Izaberite kontakte koji Vas interesuju",
          Tastature.kontaktTastatura()
        )
      );
      return null;
    case "važne informacije":
      bot.sendMessage(
        { id: userId },
        new TextMessage(Poruke.vazneInformacije, Tastature.pocetnaTastatura())
      );
      return null;
    case "postavi pitanje operateru":
      bot.sendMessage(
        { id: userId },
        new TextMessage("Postavite pitanje", Tastature.pocetnaTastatura())
      );
      operater.push(userId);
      return null;
    case "glavni meni":
      bot.sendMessage(
        { id: userId },
        new TextMessage(
          "Molim Vas izaberite komandu iz menija",
          Tastature.pocetnaTastatura()
        )
      );
      return null;
    case "opština budva":
      bot.sendMessage(
        { id: userId },
        new TextMessage(Poruke.opstinaBudva, Tastature.pocetnaTastatura())
      );
      return null;
    case "organi uprave":
      bot.sendMessage(
        { id: userId },
        new TextMessage(Poruke.organiUprave, Tastature.pocetnaTastatura())
      );
      return null;
    case "stručne i posebne službe":
      bot.sendMessage(
        { id: userId },
        new TextMessage(Poruke.strucneSluzbe, Tastature.pocetnaTastatura())
      );
      return null;
    case "lokalni funkcioneri":
      bot.sendMessage(
        { id: userId },
        new TextMessage(Poruke.lokalniFunkcioneri, Tastature.pocetnaTastatura())
      );
      return null;
    case "građanski biro":
      bot.sendMessage(
        { id: userId },
        new TextMessage(Poruke.gradjanskiBiro, Tastature.pocetnaTastatura())
      );
      return null;
    case "opštinski tim za zaštitu i spašavanje":
      bot.sendMessage(
        { id: userId },
        new TextMessage(Poruke.zastita, Tastature.pocetnaTastatura())
      );
      return null;
    default:
      if (operater.includes(userId)) {
        Pitanje.create({
          viberId: userId,
          pitanje: tekstPoruke,
          odgovoreno: 0,
          odgovor: "",
          kontakt: "",
          trajno: 0,
        });
        bot.sendMessage(
          { id: userId },
          new TextMessage(
            "Poruka je proslijeđena operateru. Odgovorićemo Vam čim budemo u mogućnosti.",
            Tastature.pocetnaTastatura()
          )
        );
        return null;
      } else {
        bot.sendMessage(
          { id: userId },
          new TextMessage(
            "Molim Vas izaberite komandu iz menija",
            Tastature.pocetnaTastatura()
          )
        );
      }
  }
});

// Bot onConversationStarted
bot.onConversationStarted((userProfile, isSubscribed, context, onFinish) =>
  onFinish(
    bot.sendMessage({ id: userProfile.id }, pocetnaPoruka),
    Tastature.pocetnaTastatura()
  )
);

// Bot onSubscribe
bot.onSubscribe((response) => {
  const userId = response.userProfile.id;
  const userName = response.userProfile.name;
  User.create({ viberId: userId, name: userName });
  bot.sendMessage({ id: userId }, pocetnaPoruka);
});

// Pomocne funkcije
function isOperater(id) {
  if (id in operater) {
    return true;
  } else return false;
}

function authenticateToken(request, response, next) {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("token: ", token);
  if (token == null) return response.sendStatus(401);
  jwt.verify(token, process.env.SECRET_KEY, (err, admin) => {
    if (err) {
      console.log(err);
      return response.sendStatus(403);
    }
    request.admin = admin;
    next();
  });
}

// Routes
app.get("/", function (request, response) {
  response.sendStatus(200);
});

app.get("/proba", function (request, response) {
  response.send(operater);
});

app.get("/users", authenticateToken, function (request, response) {
  var dbUsers = [];
  User.findAll().then(function (users) {
    users.forEach(function (user) {
      dbUsers.push({ viberId: user.viberId, name: user.name });
    });
    response.send(dbUsers);
  });
});

app.get("/admins", authenticateToken, function (request, response) {
  var dbAdmins = [];
  Admin.findAll().then(function (admins) {
    admins.forEach(function (admin) {
      dbAdmins.push({ username: admin.username, password: admin.password });
    });
    response.send(dbAdmins);
  });
});

app.get("/pitanja", authenticateToken, function (request, response) {
  var dbPoruke = [];
  Pitanje.findAll().then(function (poruke) {
    poruke.forEach(function (poruka) {
      dbPoruke.push({
        id: poruka.id,
        viberId: poruka.viberId,
        pitanje: poruka.pitanje,
        odgovoreno: poruka.odgovoreno,
        odgovor: poruka.odgovor,
        kontakt: poruka.kontakt,
      });
    });
    response.send(dbPoruke);
  });
});

app.get("/neodgovorenaPitanja", authenticateToken, function (
  request,
  response
) {
  var dbPoruke = [];
  Pitanje.findAll({
    where: {
      odgovoreno: false,
    },
  }).then(function (poruke) {
    poruke.forEach(function (poruka) {
      dbPoruke.push({
        id: poruka.id,
        viberId: poruka.viberId,
        pitanje: poruka.pitanje,
        odgovoreno: poruka.odgovoreno,
        odgovor: poruka.odgovor,
        kontakt: poruka.kontakt,
      });
    });
    response.send(dbPoruke);
  });
});

app.get("/faqs", authenticateToken, function (request, response) {
  var dbFaq = [];
  FAQ.findAll().then(function (faqs) {
    faqs.forEach(function (faq) {
      dbFaq.push({
        id: faq.id,
        pitanje: faq.pitanje,
        odgovor: faq.odgovor,
        kontakt: faq.kontakt,
      });
    });
    response.send(dbFaq);
  });
});

app.post("/dodajFaq", authenticateToken, jsonParser, function (
  request,
  response
) {
  const pitanje = request.body.pitanje;
  const odgovor = request.body.odgovor;
  const kontakt = request.body.kontakt;
  FAQ.create({ pitanje: pitanje, odgovor: odgovor, kontakt: kontakt })
    .then(function (faqs) {
      response.sendStatus(200);
    })
    .catch((err) => {
      response.send(err);
    });
});

app.post("/updateFaq", authenticateToken, jsonParser, function (
  request,
  response
) {
  const id = request.body.id;
  const pitanje = request.body.pitanje;
  const odgovor = request.body.odgovor;
  const kontakt = request.body.kontakt;
  FAQ.update(
    { pitanje: pitanje, odgovor: odgovor, kontakt: kontakt },
    {
      where: {
        id: id,
      },
      returning: true,
      plain: true,
    }
  )
    .then(function (updated) {
      response.send("Update odradjen");
    })
    .catch((err) => {
      response.send(err);
    });
});

app.post("/deleteFaqById", authenticateToken, jsonParser, function (
  request,
  response
) {
  const id = request.body.id;
  FAQ.destroy({
    where: {
      id: id,
    },
  })
    .then(function (updated) {
      response.send("Pitanje je obrisano");
    })
    .catch((err) => {
      response.send(err);
    });
});

app.post("/posaljiOdgovor", authenticateToken, jsonParser, function (
  request,
  response
) {
  const id = request.body.id;
  const viberId = request.body.viberId;
  const pitanje = request.body.pitanje;
  const odgovoreno = true;
  const odgovor = request.body.odgovor;
  const kontakt = request.body.kontakt;
  //const trajno = request.body.trajno;
  const tekstPoruke =
    "Pitali ste: " +
    pitanje +
    "\nOdgovor: " +
    odgovor +
    "\nKontakt: " +
    kontakt;
  Pitanje.update(
    { odgovoreno: true, odgovor: odgovor, kontakt: kontakt },
    {
      where: {
        id: id,
      },
      returning: true,
      plain: true,
    }
  )
    .then(function (updated) {
      bot.sendMessage(
        { id: viberId },
        new TextMessage(tekstPoruke, Tastature.pocetnaTastatura())
      );
      response.send("Odgovor je poslat korisniku");
    })
    .catch((err) => {
      response.send(err);
    });
});

app.post("/login", urlencodedParser, function (request, response) {
  const username = request.body.username;
  const password = request.body.password;
  var adminPass;
  var adminUser;
  Admin.findOne({
    where: {
      username: username,
    },
  }).then(function (admin) {
    //console.log("admin: ", admin.password)
    adminPass = admin.password;
    adminUser = admin.user;
    if (bcrypt.compareSync(password, adminPass)) {
      const token = jwt.sign({ adminUser }, process.env.SECRET_KEY, {
        expiresIn: "24h",
      });
      response.json({
        user: adminUser,
        token: token,
        message: "Logged In",
      });
    } else {
      response.status(401).json({
        message: "Unauthorized",
      });
    }
  });
});

app.post("/dodajAdmina", jsonParser, function (request, response) {
  const admin = request.body.admin;
  const password = request.body.password;
  const hashedPass = bcrypt.hashSync(password, 10);
  const pin = request.body.pin;
  if (pin === process.env.PIN) {
    console.log("hashedPass: ", hashedPass);
    Admin.create({ username: admin, password: hashedPass });
    response.send({ admin, hashedPass });
  } else {
    response.sendStatus(401);
  }
});

app.get("/probaTokena", authenticateToken, function (request, response) {
  response.send(request.admin);
});

// Viber webhook
app.use("/viber/webhook", bot.middleware());
bot
  .setWebhook("https://chatbotapi.digitalcontrol.me")
  .then(() => console.log("set webhook"))
  .catch((err) => console.log(err));
