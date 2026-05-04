/// <reference types="jest" />
// Unit tests for the Navbar component

import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../../components/Navbar";

jest.mock("next/link", () => {
  return ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
});

const mockUsePathname = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

// Mock fetch so /api/me returns a logged-in admin user — ensures all nav links render
beforeEach(() => {
  jest.clearAllMocks();
  mockUsePathname.mockReturnValue("/");
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      id: 1,
      name: "Test User",
      email: "test@test.com",
      dbRole: "Manager",
      role: "admin",
    }),
  }) as any;
});

describe("Navbar", () => {
  it("renders the page title", () => {
    render(<Navbar pageTitle="Dashboard" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("does not show menu items before opening the menu", () => {
    render(<Navbar pageTitle="Home" />);
    expect(screen.queryByText("Schedule")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("opens the menu when the hamburger button is clicked", async () => {
    render(<Navbar pageTitle="Home" />);

    const button = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });

    fireEvent.click(button);

    // Wait for fetch/state to settle
    await new Promise((r) => setTimeout(r, 0));

    expect(screen.getByText("Schedule")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.getByText("People")).toBeInTheDocument();
  });

  it("renders the active link based on pathname", async () => {
    mockUsePathname.mockReturnValue("/dashboard");

    render(<Navbar pageTitle="Dashboard" />);

    const button = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });

    fireEvent.click(button);
    await new Promise((r) => setTimeout(r, 0));

    const dashboardLinks = screen.getAllByText("Dashboard");
    const dashboardLink = dashboardLinks[1].closest("a");

    expect(dashboardLink).toHaveClass("active");
  });

  it("closes the menu when clicking outside", async () => {
    render(<Navbar pageTitle="Home" />);

    const button = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });

    fireEvent.click(button);
    await new Promise((r) => setTimeout(r, 0));

    expect(screen.getByText("Schedule")).toBeInTheDocument();

    fireEvent.mouseDown(document);
    expect(screen.queryByText("Schedule")).not.toBeInTheDocument();
  });

  it("closes the menu when the route changes", async () => {
    const { rerender } = render(<Navbar pageTitle="Home" />);

    const button = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });

    fireEvent.click(button);
    await new Promise((r) => setTimeout(r, 0));

    expect(screen.getByText("Schedule")).toBeInTheDocument();

    mockUsePathname.mockReturnValue("/history");
    rerender(<Navbar pageTitle="History" />);

    expect(screen.queryByText("Schedule")).not.toBeInTheDocument();
  });

  it("uses the default title when no pageTitle is provided", () => {
    render(<Navbar />);
    expect(screen.getByText("Nexus Management")).toBeInTheDocument();
  });
});
