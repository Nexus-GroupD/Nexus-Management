/// <reference types="jest" />

import { render, screen, fireEvent } from "@testing-library/react";
import AnnouncementsPage from "../../app/announcements/page";

jest.mock("../../components/Navbar", () => {
  return function MockNavbar({ pageTitle }: { pageTitle?: string }) {
    return <div>{pageTitle}</div>;
  };
});

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url === "/api/me") {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          role: "admin",
          permissions: ["announcements.create", "announcements.delete"],
        }),
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    });
  }) as any;
});

describe("AnnouncementsPage", () => {
  it("renders the announcements page title", () => {
    render(<AnnouncementsPage />);
    expect(screen.getByText("Announcements")).toBeInTheDocument();
  });

  it("renders the create announcement form", async () => {
    render(<AnnouncementsPage />);

    expect(await screen.findByPlaceholderText("Announcement title...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write announcement details...")).toBeInTheDocument();
    expect(screen.getByText("Post Announcement")).toBeInTheDocument();
  });

  it("does not allow posting when title and message are empty", async () => {
    render(<AnnouncementsPage />);

    const postButton = await screen.findByText("Post Announcement");
    expect(postButton).toBeDisabled();
  });

  it("adds a new announcement when title and message are entered", async () => {
    render(<AnnouncementsPage />);

    fireEvent.change(await screen.findByPlaceholderText("Announcement title..."), {
      target: { value: "Team Meeting" },
    });

    fireEvent.change(screen.getByPlaceholderText("Write announcement details..."), {
      target: { value: "Meeting at 3 PM today." },
    });

    fireEvent.click(screen.getByText("Post Announcement"));

    expect(screen.getByText("Team Meeting")).toBeInTheDocument();
    expect(screen.getByText("Meeting at 3 PM today.")).toBeInTheDocument();
  });

  it("deletes an announcement when delete is clicked", async () => {
    render(<AnnouncementsPage />);

    expect(screen.getByText("Schedule Updated")).toBeInTheDocument();

    fireEvent.click(await screen.findByText("Delete"));

    expect(screen.queryByText("Schedule Updated")).not.toBeInTheDocument();
  });
});