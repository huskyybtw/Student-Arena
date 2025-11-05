require("dotenv").config();

module.exports = {
  api: {
    input: process.env.NEXT_PUBLIC_API_URL + "api-json",
    output: {
      mode: "tags-split",
      target: "./src/lib/api/api.ts",
      schemas: "./src/lib/api/model",
      client: "react-query",
      baseUrl: process.env.NEXT_PUBLIC_API_URL,
    },
  },
};
