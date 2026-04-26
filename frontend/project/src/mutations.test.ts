import { describe, expect, it } from "vitest";
import { signIn, signUp } from "./mutations";
import type { LoginType, User } from "./interfaces";

describe("auth mutations", () => {
  it("returns sign-in credentials for the caller to handle", () => {
    const credentials: LoginType = {
      email: "traveler@example.com",
      password: "secret-pass",
      remember: true,
    };

    expect(signIn(credentials)).toEqual(credentials);
  });

  it("returns sign-up user data for the caller to handle", () => {
    const user: User = {
      username: "traveler",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: "secret-pass",
    };

    expect(signUp(user)).toEqual(user);
  });
});
