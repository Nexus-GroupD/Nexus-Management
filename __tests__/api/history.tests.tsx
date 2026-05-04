/// <reference types="jest" />

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
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

const MOCK_EMPLOYEES = [
  { id: 1, name: "Alex Rivera" },
  { id: 2, name: "Jordan Lee" },
  { id: 3, name: "Sam Patel" },
];

// Mock global fetch to return the employee list for /api/people
beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve(MOCK_EMPLOYEES),
  } as any);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("History Page (Frontend)", () => {
  it("renders the page title and subtitle", async () => {
    await act(async () => { render(<History />); });

    expect(screen.getByText("Clock History")).toBeInTheDocument();
    expect(
      screen.getByText("Review past time entries for your team.")
    ).toBeInTheDocument();
  });

  it("renders Navbar with correct title", async () => {
    await act(async () => { render(<History />); });

    expect(screen.getByTestId("navbar")).toHaveTextContent("History");
  });

  it("renders employee filter dropdown", async () => {
    await act(async () => { render(<History />); });

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("populates dropdown with employees from /api/people", async () => {
    await act(async () => { render(<History />); });

    await waitFor(() => {
      expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
      expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
      expect(screen.getByText("Sam Patel")).toBeInTheDocument();
    });
  });

  it("passes undefined personId when 'All Employees' is selected", async () => {
    await act(async () => { render(<History />); });

    expect(mockHistoryTable).toHaveBeenCalledWith(
      expect.objectContaining({
        personId: undefined,
        limit: 50,
      })
    );
  });

  it("updates personId when a different employee is selected", async () => {
    await act(async () => { render(<History />); });

    // Wait for employees to load so handleSelect validation passes
    await waitFor(() => {
      expect(screen.getByText("Jordan Lee")).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "2" } });

    expect(mockHistoryTable).toHaveBeenLastCalledWith(
      expect.objectContaining({
        personId: 2,
        limit: 50,
      })
    );
  });

  it("renders HistoryTable component", async () => {
    await act(async () => { render(<History />); });

    expect(screen.getByTestId("history-table")).toBeInTheDocument();
  });
});
