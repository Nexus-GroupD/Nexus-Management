/// <reference types="jest" />
//unit test for the Navbar component to verify that it renders correctly, 
//opens and closes the menu, and highlights the active route. The test was successfully executed 
//using Jest and React Testing Library. While some unrelated test files had existing configuration issues, 
//the Navbar test ran successfully and validated the intended functionality

import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../../components/Navbar";

// Mock next/link so it behaves like a normal anchor in tests
jest.mock("next/link", () => {
  return ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
});

// Mock usePathname and useRouter from next/navigation
const mockUsePathname = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

describe("Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
  });

  it("renders the page title", () => {
    render(<Navbar pageTitle="Dashboard" />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("does not show menu items before opening the menu", () => {
    render(<Navbar pageTitle="Home" />);

    expect(screen.queryByText("Schedule")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("opens the menu when the hamburger button is clicked", () => {
    render(<Navbar pageTitle="Home" />);

    const button = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });

    fireEvent.click(button);

    expect(screen.getByText("Schedule")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.getByText("People")).toBeInTheDocument();
  });

 it("renders the active link based on pathname", () => {
  mockUsePathname.mockReturnValue("/dashboard");

  render(<Navbar pageTitle="Dashboard" />);

  const button = screen.getByRole("button", {
    name: /toggle navigation menu/i,
  });

  fireEvent.click(button);

  const dashboardLinks = screen.getAllByText("Dashboard");
  const dashboardLink = dashboardLinks[1].closest("a");

  expect(dashboardLink).toHaveClass("active");
});

  it("closes the menu when clicking outside", () => {
    render(<Navbar pageTitle="Home" />);

    const button = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });

    fireEvent.click(button);

    expect(screen.getByText("Schedule")).toBeInTheDocument();

    fireEvent.mouseDown(document);

    expect(screen.queryByText("Schedule")).not.toBeInTheDocument();
  });

  it("closes the menu when the route changes", () => {
    const { rerender } = render(<Navbar pageTitle="Home" />);

    const button = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });

    fireEvent.click(button);

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
