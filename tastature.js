const KeyboardGeneratorModule = require("./keyboard_generator.js");

function pocetnaTastatura() {
  let keyboardGenerator = new KeyboardGeneratorModule();
  keyboardGenerator.addElement("Kontakt", "Kontakt", "#0B426F");
  keyboardGenerator.addElement(
    "Važne informacije",
    "Važne informacije",
    "#0B426F"
  );
  keyboardGenerator.addElement(
    "Postavi pitanje operateru",
    "Postavi pitanje operateru",
    "#0B426F"
  );
  return keyboardGenerator.build();
}

function kontaktTastatura() {
  let keyboardGenerator = new KeyboardGeneratorModule();
  keyboardGenerator.addElement("Opština Budva", "Opština Budva", "#0B426F");
  keyboardGenerator.addElement("Organi uprave", "Organi uprave", "#0B426F");
  keyboardGenerator.addElement(
    "Stručne i posebne službe",
    "Stručne i posebne službe",
    "#0B426F"
  );
  keyboardGenerator.addElement(
    "Lokalni funkcioneri",
    "Lokalni funkcioneri",
    "#0B426F"
  );
  keyboardGenerator.addElement("Građanski biro", "Građanski biro", "#0B426F");
  keyboardGenerator.addElement(
    "Opštinski tim za zaštitu i spašavanje",
    "Opštinski tim za zaštitu i spašavanje",
    "#0B426F"
  );
  keyboardGenerator.addElement("Glavni meni", "Glavni meni", "#0B426F");
  return keyboardGenerator.build();
}

exports.pocetnaTastatura = pocetnaTastatura;
exports.kontaktTastatura = kontaktTastatura;
