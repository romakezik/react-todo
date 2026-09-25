import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import Home from "./Home";
import { AuthContext } from "../hooks/useAuth";
import type { AuthContextValue } from "../types/types";
import { todo, ok, fail, query } from "../test/helpers";

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));
vi.mock("../lib/supabase", () => ({
  supabase: { from: mockFrom },
}));

function renderWithAuth(ui: ReactNode) {
  const mockAuth: AuthContextValue = {
    user: { id: "u1", name: "Test", email: "test@test.com" },
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    deleteProfile: vi.fn(),
  };
  return render(
    <AuthContext.Provider value={mockAuth}>{ui}</AuthContext.Provider>,
  );
}

describe("Home", () => {
  beforeEach(() => vi.clearAllMocks());
  it("показывает задачи после загрузки", async () => {
    mockFrom.mockReturnValueOnce(ok([todo("1", "Молоко"), todo("2", "Хлеб")]));

    renderWithAuth(<Home />);

    expect(await screen.findByText("Молоко")).toBeInTheDocument();
    expect(screen.getByText("Хлеб")).toBeInTheDocument();
  });

  it("пустое состояние при пустом списке", async () => {
    mockFrom.mockReturnValueOnce(ok([]));

    renderWithAuth(<Home />);

    expect(await screen.findByText("Пока ничего нет")).toBeInTheDocument();
  });

  it("ошибка загрузки вместо списка", async () => {
    mockFrom.mockReturnValueOnce(fail("ошибка сети"));

    renderWithAuth(<Home />);

    expect(await screen.findByText(/Ошибка загрузки/)).toBeInTheDocument();
    expect(screen.queryByText("Молоко")).not.toBeInTheDocument();
  });

  it("клик по toggle отправляет update", async () => {
    mockFrom.mockReturnValueOnce(ok([todo("1", "Молоко", false)]));
    mockFrom.mockReturnValueOnce(ok(todo("1", "Молоко", true))); // ← без []

    renderWithAuth(<Home />);

    const btn = await screen.findByText("Отметить");
    await act(async () => {
      fireEvent.click(btn);
    });
    expect(mockFrom).toHaveBeenCalledTimes(2);
    expect(mockFrom).toHaveBeenCalledWith("todos");
  });

  it("фильтр Активные скрывает выполненные", async () => {
    mockFrom.mockReturnValueOnce(
      ok([todo("1", "Молоко", false), todo("2", "Хлеб", true)]),
    );
    renderWithAuth(<Home />);

    await screen.findByText("Молоко");
    fireEvent.click(screen.getByText("Активные"));

    expect(screen.queryByText("Хлеб")).not.toBeInTheDocument();
    expect(screen.getByText("Молоко")).toBeInTheDocument();
    expect(screen.getByText(/Осталось: 1/)).toBeInTheDocument();
  });

  it("клик по toggle сразу меняет кнопку до ответа", async () => {
    mockFrom.mockReturnValueOnce(ok([todo("1", "Молоко", false)]));
    let resolveToggle!: (v: { data: unknown; error: unknown }) => void;
    const answer = new Promise<{ data: unknown; error: unknown }>(
      (res) => (resolveToggle = res),
    );
    mockFrom.mockReturnValueOnce(query(answer));

    renderWithAuth(<Home />);
    const btn = await screen.findByText("Отметить");

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(screen.getByText("Вернуть")).toBeInTheDocument();
    expect(screen.getByText("Отметить")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "✕" })).toBeDisabled();

    await act(async () => {
      resolveToggle({ data: todo("1", "Молоко", true), error: null });
    });
    await waitFor(() =>
      expect(screen.getByText("Вернуть")).toBeInTheDocument(),
    );
  });
});
