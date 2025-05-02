export const loginUser = async (email: string, password: string) => {
  const response = await fetch("http://localhost:3001/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error || "Login fehlgeschlagen");
  }

  const data = await response.json();

  localStorage.setItem("token", data.token);

  return {
    email,
  };
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const res = await fetch("http://localhost:3001/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    throw new Error("Registrierung fehlgeschlagen");
  }

  return res.json();
};
