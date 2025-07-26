"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Rule extends Model {}

  Rule.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      kaynak_guvenlikbolgesi: DataTypes.JSONB,
      hedef_guvenlikbolgesi: DataTypes.JSONB,
      kaynak_adresi: DataTypes.JSONB,
      hedef_adresi: DataTypes.JSONB,
      servisler: DataTypes.STRING,
      time: DataTypes.DATE,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Rule",
      tableName: "rules", // tablo ismi küçük harf ve çoğulsa bunu belirt
      timestamps: true, // Eğer createdAt, updatedAt yoksa
    }
  );

  return Rule;
};
