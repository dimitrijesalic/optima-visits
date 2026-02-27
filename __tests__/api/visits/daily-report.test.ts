import { GET } from "@/src/app/api/visits/daily-report/route";
import prisma from "@/src/lib/prisma";

jest.mock("@/src/lib/prisma", () => ({
  __esModule: true,
  default: {
    visit: { findMany: jest.fn() },
  },
}));

const mockFindMany = prisma.visit.findMany as jest.Mock;

const VALID_API_KEY = "test-api-key";

function makeRequest(apiKey?: string) {
  const headers: Record<string, string> = {};
  if (apiKey) headers["x-api-key"] = apiKey;

  return new Request("http://localhost:3000/api/visits/daily-report", {
    headers,
  });
}

describe("GET /api/visits/daily-report", () => {
  beforeEach(() => {
    process.env.API_KEY = VALID_API_KEY;
    mockFindMany.mockResolvedValue([]);
  });

  afterEach(() => {
    delete process.env.API_KEY;
  });

  it("returns 401 when no API key is provided", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("Unauthorized");
  });

  it("returns 401 when API key is invalid", async () => {
    const response = await GET(makeRequest("wrong-key"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("Unauthorized");
  });

  it("returns 200 with valid API key", async () => {
    const response = await GET(makeRequest(VALID_API_KEY));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.total).toBe(0);
    expect(body.data).toEqual([]);
  });

  it("filters by today plannedVisitDate and DONE/CANCELED status", async () => {
    await GET(makeRequest(VALID_API_KEY));

    const today = new Date().toISOString().split("T")[0];

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          plannedVisitDate: today,
          status: { in: ["DONE", "CANCELED"] },
          updatedAt: {
            gte: expect.any(Date),
            lt: expect.any(Date),
          },
        }),
      }),
    );
  });

  it("includes user info in response", async () => {
    await GET(makeRequest(VALID_API_KEY));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    );
  });

  it("returns total and data in response", async () => {
    const mockVisit = {
      id: "1",
      status: "DONE",
      plannedVisitDate: "2026-02-27",
      user: {
        id: "1",
        firstName: "Test",
        lastName: "User",
        email: "test@test.com",
      },
    };
    mockFindMany.mockResolvedValue([mockVisit]);

    const response = await GET(makeRequest(VALID_API_KEY));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.total).toBe(1);
    expect(body.data).toHaveLength(1);
  });

  it("returns 400 when an error is thrown", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"));

    const response = await GET(makeRequest(VALID_API_KEY));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Failed to fetch daily report");
  });
});
