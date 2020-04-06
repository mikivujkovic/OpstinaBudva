app.post("/alert", bodyParser.urlencoded({ extended: true }), function (
  req,
  res
) {
  console.log(req.body);
  let text = req.body.body;
  let subject = req.body.subject || "";
  let id = req.body.id;
  getSubs((rows) => {
    rows.forEach((row) => {
      sendRichMessage(row.id, subject, text);
    });
    res.sendStatus(200);
  }, id);
});

function sendRichMessage(id, subject, text) {
  const keyboard = redeemCommandKeyboard();
  let message = new RichMediaMessage(
    {
      Type: "rich_media",
      BgColor: "#7499FF", // getColor(subject, text),
      Buttons: [
        {
          Columns: 6,
          Rows: 7,
          ActionType: "reply",
          ActionBody: "start",
          BgColor: "#7499FF",
          Text: `<b>${subject}</b>`,
          TextSize: "large",
          TextVAlign: "middle",
          TextHAlign: "middle",
        },
        {
          Columns: 6,
          Rows: 7,
          ActionType: "reply",
          ActionBody: "start",
          BgColor: "#E97659",
          Text: `${text}`,
          TextSize: "medium",
          TextVAlign: "top",
          TextHAlign: "middle",
        },
      ],
    },
    keyboard,
    null,
    null,
    VIBER_TOKEN,
    "Obavjestenje",
    2
  );
  bot.sendMessage({ id: id }, message);
}

function addSubs(sender_psid, cb) {
  db.get(`select * from Subs where id = '${sender_psid}'`, (err, row) => {
    if (!row) {
      db.run(`INSERT INTO Subs (id) VALUES ('${sender_psid}')`, (err, rows) => {
        sendStartMessage(sender_psid, "Prijavili ste se za obavjestenja");
      });
    } else {
      sendStartMessage(sender_psid, "Vec ste prijavljeni za obavjestenja");
    }
  });
}

function removeSubs(sender_psid, cb) {
  db.run(`delete from Subs where id = '${sender_psid}'`, (err, row) => {
    sendStartMessage(sender_psid, "Odjavili ste se");
  });
}

function demo(sender_id) {
  //Object.keys(text_colors).forEach(text_key => {
  //   sendRichMessage(sender_id, 'Naslov obavjestenja', 'Tekst obavjestenja')
  //});
  sendRichMessage(
    sender_id,
    "Ovo je naslov demo obavjestenja",
    "Ovo je tekst demo obavjestenja u kojem Vas informisemo o novostima u pravnoj, finansijskoj i poreskoj sferi."
  );
  redeemCommandKeyboard();
}

function getSubs(cb, id) {
  let sql = "select * from Subs";
  if (id) sql = sql + ` where id = '${id}'`;
  db.all(sql, (err, rows) => {
    cb(rows);
  });
}

db.serialize(function () {
  if (!exists) {
    db.run("CREATE TABLE Subs (id TEXT)");
  } else {
    getSubs((rows) => {
      console.log(rows);
    });
  }
});

let text_colors = {
  warning: "#FFC859",
  average: "#FFA059",
  high: "#E97659",
  disaster: "#E45959",
  information: "#7499FF",
};

function getColor(subject, text) {
  let color = "#cccccc";
  if (subject.toLowerCase().indexOf("problem") !== -1) {
    Object.keys(text_colors).forEach((key) => {
      if (text.toLowerCase().indexOf(key) !== -1) color = text_colors[key];
    });
  } else if (subject.toLowerCase().indexOf("resolved") !== -1) {
    color = "#89FF76";
  }
  return color;
}

function sendQuestion(response) {
  return response.send(
    new TextMessage("Would you like to build a bot?", redeemCommandKeyboard())
  );
}

const poruka = `Dobrodošli na chat bot Opštine Budva!\n
Molimo sve građane i korisnike usluga Opštine Budva da, tokom trajanja privremenih mjera Ministarstva zdravlja Crne Gore i preporuka Vlade Crne Gore, zahtjeve i upite prema jedinici lokalne samouprave podnose elektronski ili putem telefona.\n
Konsultacije sa obrađivačem predmeta u nadležnom organu mogu se obaviti isključivo telefonski ili elektronski, osim u slučaju kada interes stranke ili zaštita života i zdravlja ili imovine veće vrijednosti zahtijeva hitno postupanje.\n
U nastavku su telefonski i mail kontakti svih organa lokalne samouprave i uprave.\n
Štiteći druge, štitimo sebe.\n
Ostanite zdravi.`;

const kontakt = `
Opština Budva\n
Trg Sunca 3\n
Budva, 85310\n
Crna Gora\n
+ Tel: +38233451000\n
Sekretarijat za društvene djelatnosti\n
Tel: 078119688\n
Tel: 078119689\n
Email: drustvene.djelatnosti@budva.me\n
E-mail: ljiljana.pjerotic@budva.me\n
Sekretarijat za komunalno-stambene poslove\n
Tel: 033451316
E-mail: sia@budva.me\n
E-mail: srdjan.gregovic@budva.me\n
Sekretarijat za investicije\n
Tel: 033455735\n
Fax: 033455735\n
Email: investicije@budva.me\n
Email: mladen.mikijelj@budva.me\n
Sekretarijat za lokalnu samoupravu\n
Tel: 033451272\n
Fax: 033451272\n
Fax: 033451743\n
Email: lokalna.samouprava@budva.me\n
Email: milijana.vukotic@budva.me\n
Sekretarijat za finansije\n
Tel: 033454727\n
Tel: 033451452\n
Email: finansije@budva.me\n
Email: petar.odzic@budva.me\n
Sekretarijat za privredu\n
Tel: 033452052\n
Email: privreda@budva.me\n
Email: slavica.maslovar@budva.me\n
Sekretarijat za urbanizam i održivi razvoj\n
Tel: 033451287\n
Tel: 033451287\n
Email: urbanizam@budva.me\n
Email: stevo.davidovic@budva.me\n
Sekretarijat za zaštitu imovine\n
Tel: 033456922\n
Fax: 033456922\n
Email: zastita.imovine@budva.me\n
Email: nikola.plamenac@budva.me\n
Centar za informacione tehnologije\n
Tel: 033402450\n
Fax: 033402451\n
Email: informatika@budva.me\n
Email: zeljko.racanovic@budva.me\n
Služba predsjednika\n
Nacelnik Službe predsjednika\n
Tel: 033403812\n
Mail: kabinet@budva.me\n
Mail: nikola.jovanovic@budva.me\n
Potpredsjednici\n
Tel: 033402084\n
Fax: 033402085\n
Email: vladimir.bulatovic@budva.me\n
Email: marko.markovic@budva.me\n
PR služba i protokol\n
Tel: 033403815\n
Email: pr@budva.me\n
Email: protokol@budva.me\n
Služba glavnog administratora\n
Tel: 033451098\n
Fax: 033453307\n
Mail: danica.kovacevic@budva.me\n
Komunalna inspekcija i komunalna policija\n
Tel: 033403874\n
Tel: 033403876\n
Fax: 033403874\n
Email: kom.policija@budva.me\n
Email: aleksandar.mijatovic@budva.me\n
Uprava lokalnih javnih prihoda\n
Tel: 033474330\n
Mob: 067707444\n
Email: lokalni.prihodi@budva.me\n
Služba za naplatu naknade za komunalno opremanje građevinskog zemljišta\n
Tel: 067307579\n
Email: komunalije@budva.me\n
Email: nino.kaludjerović @budva.me\n
Služba zaštite i spašavanja\n
Tel: 033451350\n
Fax: 033451350\n
Email: sluzba.zastite@budva.me\n
Email: dragan.bozovic@budva.me\n
Služba za javne nabavke\n
Tel: 033454017\n
Email: javne.nabavke@budva.me\n
Email: tanja.simicevic@budva.me\n
Služba menadžera\n
Tel: 033688996\n
Fax: 033688997\n
Email: menadzer@budva.me\n
Email: milo.bozovic@budva.me\n
Kancelarija za borbu protiv korupcije\n
Tel: 033475188\n
Fax: 033475188\n
Email: antikorupcija@budva.me\n
Email: caslavdjurovic@budva.me\n
Služba zaštite lica i imovine\n
Tel: 03345100\n
Email: ranko.djurisic@budva.me\n
Služba Glavnog gradskog arhitekte\n
Tel: 033403820\n
Email: arhitekta@budva.me\n
Email: ana.samardzic@budva.me\n
Služba Skupštine\n
Tel: 033451944\n
Email: skupstina@budva.me\n
Email: krsto.radovic@budva.me\n
Građanski biro\n
Tel: 067 242 375\n
`;
function setup() {
  User.sync({ force: true }) // using 'force' it drops the table users if it already exists, and creates a new one
    .then(function () {
      // Add the default users to the database
      for (var i = 0; i < users.length; i++) {
        // loop through all users
        User.create({ firstName: users[i][0], lastName: users[i][1] }); // create a new entry in the users table
      }
    });
}
