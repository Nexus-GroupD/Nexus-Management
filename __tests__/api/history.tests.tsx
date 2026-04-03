/// <reference types="jest" />

import { render, screen, fireEvent } from "@testing-library/react";
import History from "../../app/history/page";

// Mock Navbar
jest.mock("@/components/Navbar", () => ({
  __esModule: true,
  default: ({ pageTitle }: { pageTitle: string }) => (
    <div data-testid="navbar">{pageTitle}</div>
  ),
}));

// Mock HistoryTable
const mockHistoryTable = jest.fn();

jest.mock("@/components/historyTable", () => ({
  __esModule: true,
  default: (props: any) => {
    mockHistoryTable(props);
    return <div data-testid="history-table" />;
  },
}));

describe("History Page (Frontend)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the page title and subtitle", () => {
    render(<History />);

    expect(screen.getByText("Clock History")).toBeInTheDocument();
    expect(
      screen.getByText("Review past time entries for your team.")
    ).toBeInTheDocument();
  });

  it("renders Navbar with correct title", () => {
    render(<History />);

    expect(screen.getByTestId("navbar")).toHaveTextContent("History");
  });

  it("renders employee filter dropdown", () => {
    render(<History />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("passes undefined personId when 'All Employees' is selected", () => {
    render(<History />);

    expect(mockHistoryTable).toHaveBeenCalledWith(
      expect.objectContaining({
        personId: undefined,
        limit: 50,
      })
    );
  });

  it("updates personId when a different employee is selected", () => {
    render(<History />);

    const select = screen.getByRole("combobox");

    fireEvent.change(select, { target: { value: "2" } });

    expect(mockHistoryTable).toHaveBeenLastCalledWith(
      expect.objectContaining({
        personId: 2,
        limit: 50,
      })
    );
  });

  it("renders HistoryTable component", () => {
    render(<History />);

    expect(screen.getByTestId("history-table")).toBeInTheDocument();
  });
});
