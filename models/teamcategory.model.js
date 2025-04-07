const mongoose = require("mongoose");

const TeamCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

const TeamCategory = mongoose.model("TeamCategory", TeamCategorySchema);
module.exports = TeamCategory;