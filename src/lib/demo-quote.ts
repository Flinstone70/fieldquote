import type { Quote } from "./types";

export const demoQuote: Quote = {
  id: "demo-preview-quote",
  userId: "demo",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  businessName: "Meridian Electrical Ltd",
  businessEmail: "quotes@meridianelectrical.co.uk",
  clientName: "Helen Crawford",
  clientEmail: "helen.crawford@email.com",
  jobTitle: "Consumer unit upgrade & certification",
  jobDescription:
    "Full replacement of existing consumer unit with 18-way dual RCD board. Testing, certification, and building regs notification included. Work scheduled within 5 business days of deposit receipt.",
  lineItems: [
    {
      id: "1",
      description: "Labour — consumer unit replacement",
      quantity: 1,
      unitPricePence: 65000,
    },
    {
      id: "2",
      description: "Materials — dual RCD board & breakers",
      quantity: 1,
      unitPricePence: 28500,
    },
    {
      id: "3",
      description: "Testing, certification & notification",
      quantity: 1,
      unitPricePence: 12000,
    },
  ],
  depositPercent: 30,
  status: "sent",
};
