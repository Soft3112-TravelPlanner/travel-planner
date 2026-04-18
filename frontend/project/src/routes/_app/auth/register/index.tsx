import type { RegisterType } from "@/interfaces";
import { signUp } from "@/mutations";
import { Card, CardHeader, CardBody, Form, Button, Input } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/_app/auth/register/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [serverEmailError, setServerEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState<string>("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevents page reload
    setServerEmailError("");
    setIsLoading(true);

    // Get form data using native FormData
    const rawData = Object.fromEntries(new FormData(e.currentTarget));
    delete rawData.confirmPassword;

    const data = rawData as unknown as RegisterType;

    console.log(signUp(data));

    setIsLoading(false);
    // Add your registration logic here
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-4 shadow-lg">
        <CardHeader className="flex justify-center pb-0">
          <h2 className="text-2xl font-bold ">Sign Up</h2>
        </CardHeader>

        <CardBody>
          {/* HeroUI Form component uses native validation behavior */}
          <Form
            validationBehavior="native"
            onSubmit={onSubmit}
            className="flex flex-col gap-4 w-full"
          >
            {/* First & Last Name */}
            <div className="flex gap-4 w-full">
              <Input
                name="firstName"
                label="First Name"
                placeholder="Enter your first name"
                variant="bordered"
                isRequired
                errorMessage="First name is required"
                className="w-full"
              />
              <Input
                name="lastName"
                label="Last Name"
                placeholder="Enter your last name"
                variant="bordered"
                isRequired
                errorMessage="Last name is required"
                className="w-full"
              />
            </div>

            {/* Username */}
            <Input
              name="username"
              label="Username"
              placeholder="Choose a username"
              variant="bordered"
              isRequired
              errorMessage="Username is required"
              className="w-full"
            />

            {/* Email */}
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="example@mail.com"
              variant="bordered"
              isRequired
              isInvalid={serverEmailError ? true : undefined}
              errorMessage={(value) => {
                if (serverEmailError) return serverEmailError;
                if (value.validationDetails.typeMismatch)
                  return "Please enter a valid email address";
                if (value.validationDetails.valueMissing)
                  return "Email is required";
                return null;
              }}
              className="w-full"
            />

            {/* Password */}
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              variant="bordered"
              isRequired
              onValueChange={setPasswordValue} // Track password to compare later
              validate={(value) => {
                if (value.length < 8) {
                  return "Password must be at least 8 characters long";
                }
                if (!/[A-Z]/.test(value)) {
                  return "Password must contain at least one uppercase letter";
                }
                return null;
              }}
              className="w-full"
            />

            {/* Confirm Password */}
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Enter your password"
              label="Confirm Password"
              variant="bordered"
              isRequired
              validate={(value) => {
                if (value !== passwordValue) {
                  return "Passwords do not match";
                }
                return null;
              }}
              className="w-full"
              autoComplete="new-password"
            />

            <Button
              type="submit"
              color="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign Up
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
