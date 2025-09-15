require("dotenv").config();

module.exports = {
  api: {
    input: process.env.NEXT_PUBLIC_API_URL + "api-json", // or use a separate env var for the spec if needed
    output: {
      mode: "tags-split",
      target: "./src/lib/api.ts",
      schemas: "./src/lib/model",
      client: "react-query",
      baseUrl: process.env.NEXT_PUBLIC_API_URL,
    },
  },
};
