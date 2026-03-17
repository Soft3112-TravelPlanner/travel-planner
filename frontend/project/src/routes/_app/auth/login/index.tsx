import type { LoginType } from "@/interfaces";
import {
  Card,
  CardHeader,
  CardBody,
  Form,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox, // Checkbox eklendi
} from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/_app/auth/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [serverEmailError, setServerEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State and hooks for the forgot password modal
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Main Login Form Submit
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerEmailError("");

    // Get form data
    const rawData = Object.fromEntries(new FormData(e.currentTarget));
    console.log(rawData.remember);

    // Checkbox değeri 'on' stringi olarak gelir, bunu boolean'a çevirelim
    const data = {
      ...rawData,
      remember: rawData.remember === "",
    } as unknown as LoginType;

    console.log("Login Data:", data);
    setIsLoading(false);
  };

  // Forgot Password Form Submit
  const handleForgotPassword = (
    e: FormEvent<HTMLFormElement>,
    onClose: () => void,
  ) => {
    e.preventDefault();
    setIsForgotLoading(true);

    // Simulating a backend request
    setTimeout(() => {
      console.log("Password reset link sent to:", forgotEmail);
      setIsForgotLoading(false);
      setForgotEmail(""); // Clear input
      onClose(); // Close modal
    }, 1500);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-4 shadow-lg">
        <CardHeader className="flex justify-center pb-0">
          <h2 className="text-2xl font-bold">Sign In</h2>
        </CardHeader>

        <CardBody>
          <Form
            validationBehavior="native"
            onSubmit={onSubmit}
            className="flex flex-col gap-4 w-full"
          >
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

            {/* Remember Me & Forgot Password Row */}
            <div className="flex w-full items-center justify-between ">
              <Checkbox name="remember" size="sm" color="primary">
                Remember me
              </Checkbox>
              <span
                onClick={onOpen}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                Forgot password?
              </span>
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </Form>
        </CardBody>
      </Card>

      {/* Forgot Password Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <Form
              validationBehavior="native"
              onSubmit={(e) => handleForgotPassword(e, onClose)}
              className="w-full"
            >
              <ModalHeader className="flex flex-col gap-1">
                Reset Password
              </ModalHeader>
              <ModalBody className="w-full">
                <p className="text-sm text-default-500 mb-2">
                  Enter the email address associated with your account. We'll
                  send you a password reset link.
                </p>
                <Input
                  autoFocus
                  name="forgot_email"
                  type="email"
                  label="Email"
                  placeholder="mail@example.com"
                  variant="bordered"
                  isRequired
                  value={forgotEmail}
                  onValueChange={setForgotEmail}
                  errorMessage="Please enter a valid email address"
                  className="w-full"
                />
              </ModalBody>
              <ModalFooter className="w-full flex justify-end">
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isForgotLoading}
                >
                  Send
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
