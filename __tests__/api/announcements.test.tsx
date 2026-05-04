/// <reference types="jest" />

import { render, screen, fireEvent } from "@testing-library/react";
import AnnouncementsPage from "../../app/announcements/page";

jest.mock("../../components/Navbar", () => {
  return function MockNavbar({ pageTitle }: { pageTitle?: string }) {
    return <div>{pageTitle}</div>;
  };
});

describe("AnnouncementsPage", () => {
  it("renders the announcements page title", () => {
    render(<AnnouncementsPage />);
    expect(screen.getByText("Announcements")).toBeInTheDocument();
  });

  it("renders the create announcement form", () => {
    render(<AnnouncementsPage />);

    expect(screen.getByPlaceholderText("Announcement title...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write announcement details...")).toBeInTheDocument();
    expect(screen.getByText("Post Announcement")).toBeInTheDocument();
  });

  it("does not allow posting when title and message are empty", () => {
    render(<AnnouncementsPage />);

    const postButton = screen.getByText("Post Announcement");
    expect(postButton).toBeDisabled();
  });

  it("adds a new announcement when title and message are entered", () => {
    render(<AnnouncementsPage />);

    fireEvent.change(screen.getByPlaceholderText("Announcement title..."), {
      target: { value: "Team Meeting" },
    });

    fireEvent.change(screen.getByPlaceholderText("Write announcement details..."), {
      target: { value: "Meeting at 3 PM today." },
    });

    fireEvent.click(screen.getByText("Post Announcement"));

    expect(screen.getByText("Team Meeting")).toBeInTheDocument();
    expect(screen.getByText("Meeting at 3 PM today.")).toBeInTheDocument();
  });

  it("deletes an announcement when delete is clicked", () => {
    render(<AnnouncementsPage />);

    expect(screen.getByText("Schedule Updated")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Delete"));

    expect(screen.queryByText("Schedule Updated")).not.toBeInTheDocument();
  });
});