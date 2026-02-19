import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCategories,
  getMessages,
  loginMunicipal,
  resolveComplaint,
  sendMessage,
} from "./api";
import { createClient } from "./supabase/client";

vi.mock("./supabase/client", () => ({
  createClient: vi.fn(),
}));

describe("api critical paths", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loginMunicipal posts credentials to auth endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await loginMunicipal("mun-1", "secret");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/auth/login");
    expect(options.method).toBe("POST");
    expect(options.body).toBe(JSON.stringify({ municipalId: "mun-1", password: "secret" }));
    expect(options.headers.Authorization).toMatch(/^Bearer /);
  });

  it("getCategories fetches categories endpoint", async () => {
    const categories = [{ id: "roads", name: "Roads", department_id: "dept1" }];
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => categories,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getCategories();

    expect(result).toEqual(categories);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("/categories");
  });

  it("resolveComplaint sends PUT with image payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 99 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await resolveComplaint(99, "https://img.test/a.jpg", "Officer One");

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/complaints/99/resolve");
    expect(options.method).toBe("PUT");
    expect(options.body).toBe(
      JSON.stringify({ imageUrl: "https://img.test/a.jpg", officerName: "Officer One" }),
    );
  });

  it("getMessages maps and orders chat messages oldest first", async () => {
    const dbRows = [
      {
        id: 2,
        state_id: "state-1",
        municipal_id: "mun-1",
        sender_type: "state",
        sender_name: "Punjab State",
        message_text: "Second",
        sent_at: "2026-02-19T10:05:00.000Z",
        read_at: null,
        is_read: false,
        priority: "high",
        message_type: "directive",
        complaint_id: 22,
        municipals: { name: "SAS Nagar" },
        states: { name: "Punjab" },
      },
      {
        id: 1,
        state_id: "state-1",
        municipal_id: "mun-1",
        sender_type: "municipal",
        sender_name: "SAS Nagar Team",
        message_text: "First",
        sent_at: "2026-02-19T10:00:00.000Z",
        read_at: null,
        is_read: false,
        priority: "normal",
        message_type: "text",
        complaint_id: null,
        municipals: { name: "SAS Nagar" },
        states: { name: "Punjab" },
      },
    ];

    const messageQuery: any = {};
    messageQuery.select = vi.fn(() => messageQuery);
    messageQuery.eq = vi.fn(() => messageQuery);
    messageQuery.order = vi.fn(() => messageQuery);
    messageQuery.limit = vi.fn(async () => ({ data: dbRows, error: null }));

    (createClient as any).mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "state_municipal_messages") return messageQuery;
        throw new Error(`Unexpected table: ${table}`);
      }),
    });

    const messages = await getMessages("state-1", "mun-1");

    expect(messages).toHaveLength(2);
    expect(messages[0].id).toBe(1);
    expect(messages[1].id).toBe(2);
    expect(messages[0].municipalName).toBe("SAS Nagar");
  });

  it("sendMessage inserts chat message and updates thread", async () => {
    const inserted = {
      id: 77,
      state_id: "state-1",
      municipal_id: "mun-1",
      sender_type: "state",
      sender_name: "Punjab State",
      message_text: "Please update",
      sent_at: "2026-02-19T10:00:00.000Z",
      read_at: null,
      is_read: false,
      priority: "high",
      message_type: "query",
      complaint_id: 300,
    };

    const insertSingle = vi.fn(async () => ({ data: inserted, error: null }));
    const upsert = vi.fn(async () => ({ error: null }));

    (createClient as any).mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "state_municipal_messages") {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: insertSingle,
              })),
            })),
          };
        }
        if (table === "conversation_threads") {
          return { upsert };
        }
        throw new Error(`Unexpected table: ${table}`);
      }),
    });

    const message = await sendMessage(
      "state-1",
      "mun-1",
      "state",
      "Punjab State",
      "Please update",
      "high",
      "query",
      300,
    );

    expect(message.id).toBe(77);
    expect(message.complaintId).toBe(300);
    expect(upsert).toHaveBeenCalledTimes(1);
  });
});

