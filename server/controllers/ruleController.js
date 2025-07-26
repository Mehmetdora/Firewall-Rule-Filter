import Joi from "joi";
import pgp from "pg-promise";

const rules = [
  {
    id: 1,
    title: "Deneme Rule 1",
    message: "Rule 1 ",
    time: "3 weeks ago",
    kaynak_guvenlikbolgesi: { value: "LAN", isChecked: true },
    hedef_guvenlikbolgesi: { value: "LAN", isChecked: true },
    kaynak_adresi: { value: "122.22.2.2", isChecked: true },
    hedef_adresi: { value: "122.22.2.2", isChecked: true },
    servisler: "HTTPS",
  },
  {
    id: 2,
    title: "Firewall Rule 2",
    message: "Rule 2",
    time: "3 weeks ago",
    kaynak_guvenlikbolgesi: { value: "LAN", isChecked: true },
    hedef_guvenlikbolgesi: { value: "LAN", isChecked: true },
    kaynak_adresi: { value: "122.22.2.2", isChecked: true },
    hedef_adresi: { value: "333.22.21.2", isChecked: true },
    servisler: "HTTP",
  },
];

// DB den veri çekme fonk.
function getRulesFromDB() {
  const db = pgp("postgres://postgres:@host:5432/firewall_db");

  db.one("SELECT $1 AS value", 123)
    .then((data) => {
      console.log("DB'den alınan değer:", data.value);
      return data.value;
    })
    .catch((error) => {
      console.log("ERROR:", error);
    });
}

export function getRules(req, res) {
  // Tüm rule değerlerini gerekli bilgileri ile birlikte al

  // rules verilerini db den al

  return res.status(200).json({
    message: "Rules fetched successfully",
    rules: rules,
  });
}

export function createdRule(req, res) {
  const schema = Joi.object({
    id: Joi.number().required(),
    title: Joi.string().required(),
    message: Joi.string().required(),
    time: Joi.string().required(),
    kaynak_guvenlikbolgesi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    hedef_guvenlikbolgesi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    kaynak_adresi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    hedef_adresi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    servisler: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    console.log("Validation error:", error.details);
    return res.status(400).json({ error: error.details });
  }

  console.log("Validated Body:", value);

  var rule = rules.find((r) => r.id === value.id);
  if (rule) {
    rule.title = value.title;
    rule.message = value.message;
    rule.time = value.time;
    rule.kaynak_guvenlikbolgesi = value.kaynak_guvenlikbolgesi;
    rule.hedef_guvenlikbolgesi = value.hedef_guvenlikbolgesi;
    rule.kaynak_adresi = value.kaynak_adresi;
    rule.hedef_adresi = value.hedef_adresi;
    rule.servisler = value.servisler;
  } else {
    res.status(404).json({ error: "Rule not found" });
    return;
  }

  return res.status(200).json({ message: "Kural başarıyla düzenlendi." });
}

export function editedRule(req, res) {
  const schema = Joi.object({
    id: Joi.number().required(),
    title: Joi.string().required(),
    message: Joi.string().required(),
    time: Joi.string().required(),
    kaynak_guvenlikbolgesi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    hedef_guvenlikbolgesi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    kaynak_adresi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    hedef_adresi: Joi.object({
      value: Joi.string().required(),
      isChecked: Joi.boolean().required(),
    }).required(),
    servisler: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    console.log("Validation error:", error.details);
    return res.status(400).json({ error: error.details });
  }

  console.log("Validated Body:", value);

  var rule = rules.find((r) => r.id === value.id);
  if (rule) {
    rule.title = value.title;
    rule.message = value.message;
    rule.time = value.time;
    rule.kaynak_guvenlikbolgesi = value.kaynak_guvenlikbolgesi;
    rule.hedef_guvenlikbolgesi = value.hedef_guvenlikbolgesi;
    rule.kaynak_adresi = value.kaynak_adresi;
    rule.hedef_adresi = value.hedef_adresi;
    rule.servisler = value.servisler;
  } else {
    res.status(404).json({ error: "Rule not found" });
    return;
  }

  return res.status(200).json({ message: "Kural başarıyla düzenlendi." });
}

export function deleteRule(req, res) {
  console.log("Delete request body:", req.body);

  const ruleId = parseInt(req.body.id);
  const ruleIndex = rules.findIndex((r) => r.id === ruleId);

  if (ruleIndex === -1) {
    return res.status(404).json({ error: "Rule not found" });
  }

  rules.splice(ruleIndex, 1);
  return res.status(200).json({ message: "Rule deleted successfully" });
}
