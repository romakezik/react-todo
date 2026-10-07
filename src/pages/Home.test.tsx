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
import type { AuthContextValue, Todo } from "../types/types";
import { todo } from "../test/helpers";

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    getTodos: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
  },
}));

vi.mock("../lib/api", () => ({ api: mockApi }));

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
    mockApi.getTodos.mockResolvedValueOnce([
      todo("1", "Молоко"),
      todo("2", "Хлеб"),
    ]);

    renderWithAuth(<Home />);

    expect(await screen.findByText("Молоко")).toBeInTheDocument();
    expect(screen.getByText("Хлеб")).toBeInTheDocument();
  });

  it("пустое состояние при пустом списке", async () => {
    mockApi.getTodos.mockResolvedValueOnce([]);

    renderWithAuth(<Home />);

    expect(await screen.findByText("Пока ничего нет")).toBeInTheDocument();
  });

  it("ошибка загрузки вместо списка", async () => {
    mockApi.getTodos.mockRejectedValueOnce(new Error("ошибка сети"));

    renderWithAuth(<Home />);

    expect(await screen.findByText(/Ошибка загрузки/)).toBeInTheDocument();
    expect(screen.queryByText("Молоко")).not.toBeInTheDocument();
  });

  it("клик по чекбоксу отправляет update", async () => {
    mockApi.getTodos.mockResolvedValueOnce([todo("1", "Молоко", false)]);
    mockApi.updateTodo.mockResolvedValueOnce(todo("1", "Молоко", true));

    renderWithAuth(<Home />);

    const checkbox = (await screen.findAllByRole("checkbox"))[0];
    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(mockApi.updateTodo).toHaveBeenCalledTimes(1);
    expect(mockApi.updateTodo).toHaveBeenCalledWith("1", { completed: true });
  });

  it("фильтр Активные скрывает выполненные", async () => {
    mockApi.getTodos.mockResolvedValueOnce([
      todo("1", "Молоко", false),
      todo("2", "Хлеб", true),
    ]);
    renderWithAuth(<Home />);

    await screen.findByText("Молоко");
    fireEvent.click(screen.getByText("Активные"));

    expect(screen.queryByText("Хлеб")).not.toBeInTheDocument();
    expect(screen.getByText("Молоко")).toBeInTheDocument();
    expect(screen.getByText(/Осталось: 1/)).toBeInTheDocument();
  });

  it("клик по чекбоксу сразу меняет состояние до ответа", async () => {
    mockApi.getTodos.mockResolvedValueOnce([todo("1", "Молоко", false)]);

    let resolveToggle!: (v: Todo) => void;
    const answer = new Promise<Todo>((res) => {
      resolveToggle = res;
    });
    mockApi.updateTodo.mockReturnValueOnce(answer);

    renderWithAuth(<Home />);
    const checkbox = (await screen.findAllByRole("checkbox"))[0];

    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(screen.getByRole("checkbox")).toBeChecked();

    expect(
      screen.getByRole("button", { name: "Удалить задачу" }),
    ).toBeDisabled();

    await act(async () => {
      resolveToggle(todo("1", "Молоко", true));
    });
    await waitFor(() => expect(screen.getByRole("checkbox")).toBeChecked());
  });
});
