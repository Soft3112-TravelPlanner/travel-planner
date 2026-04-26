import type { LoginType } from "@/interfaces";
import {
  Form,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox,
  Link as HeroUILink,
  Image,
} from "@heroui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type SyntheticEvent } from "react";
import { IoMailOutline, IoLockClosedOutline, IoAirplane } from "react-icons/io5";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/auth/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const onSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const rawData = Object.fromEntries(new FormData(e.currentTarget));
    const data = {
      ...rawData,
      remember: rawData.remember === "on",
    } as unknown as LoginType;

    console.log("Login Data:", data);
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      globalThis.location.href = "/";
    }, 1500);
  };

  const handleForgotPassword = (
    e: SyntheticEvent<HTMLFormElement>,
    onClose: () => void,
  ) => {
    e.preventDefault();
    setIsForgotLoading(true);

    setTimeout(() => {
      setIsForgotLoading(false);
      setForgotEmail("");
      onClose();
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex overflow-hidden bg-background">
      {/* Left Side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full"
        >
          <div className="mb-10 text-center lg:text-left">
            <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
              <div className="bg-primary p-2 rounded-xl text-primary-foreground">
                <IoAirplane size={24} className="-rotate-45" />
              </div>
              <p className="font-bold text-2xl italic">Travel<span className="text-primary not-italic">Sync</span></p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-default-500">Enter your credentials to access your account.</p>
          </div>

          <Form
            validationBehavior="native"
            onSubmit={onSubmit}
            className="flex flex-col gap-6 w-full"
          >
            <Input
              name="email"
              type="email"
              label="Email Address"
              labelPlacement="outside"
              placeholder="name@example.com"
              variant="bordered"
              isRequired
              size="lg"
              startContent={<IoMailOutline size={20} className="text-default-400" />}
              classNames={{
                inputWrapper: "h-14 rounded-2xl border-2 hover:border-primary/50 focus-within:!border-primary transition-all",
                label: "font-bold text-default-700",
              }}
            />

            <div className="flex flex-col gap-2">
              <Input
                name="password"
                type="password"
                label="Password"
                labelPlacement="outside"
                placeholder="••••••••"
                variant="bordered"
                isRequired
                size="lg"
                startContent={<IoLockClosedOutline size={20} className="text-default-400" />}
                classNames={{
                  inputWrapper: "h-14 rounded-2xl border-2 hover:border-primary/50 focus-within:!border-primary transition-all",
                  label: "font-bold text-default-700",
                }}
              />
              <div className="flex justify-end">
                <HeroUILink
                  onPress={onOpen}
                  className="text-sm font-bold text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </HeroUILink>
              </div>
            </div>

            <Checkbox name="remember" size="md" color="primary" classNames={{ label: "text-sm font-medium" }}>
              Keep me signed in
            </Checkbox>

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/20 mt-4"
              isLoading={isLoading}
            >
              Sign In
            </Button>

            <p className="text-center text-sm text-default-500 mt-4">
              Don't have an account?{" "}
              <Link to="/auth/register" className="text-primary font-bold hover:underline">
                Create an account
              </Link>
            </p>
          </Form>
        </motion.div>
      </div>

      {/* Right Side: Image */}
      <div className="hidden lg:block flex-1 relative overflow-hidden m-4 rounded-[3rem]">
        <Image
          src="/home/yeko/.gemini/antigravity/brain/9c6c0bb9-2c90-461c-a6bf-5d3ac464db36/login_side_image_1776790702942.png"
          alt="Login background"
          className="w-full h-full object-cover"
          removeWrapper
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-16 left-16 right-16 text-white z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-4xl font-bold italic mb-4">"Adventure is worthwhile in itself."</h2>
            <p className="text-xl text-white/80 font-light">— Amelia Earhart</p>
          </motion.div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" backdrop="blur">
        <ModalContent className="rounded-[2.5rem] p-4">
          {(onClose) => (
            <Form
              validationBehavior="native"
              onSubmit={(e) => handleForgotPassword(e, onClose)}
              className="w-full"
            >
              <ModalHeader className="text-2xl font-bold italic">
                Reset Password
              </ModalHeader>
              <ModalBody className="py-4">
                <p className="text-default-500 mb-4">
                  No worries! Enter your email and we'll send you instructions to reset your password.
                </p>
                <Input
                  autoFocus
                  name="forgot_email"
                  type="email"
                  label="Email Address"
                  placeholder="mail@example.com"
                  variant="bordered"
                  isRequired
                  value={forgotEmail}
                  onValueChange={setForgotEmail}
                  classNames={{ inputWrapper: "rounded-2xl" }}
                />
              </ModalBody>
              <ModalFooter className="pt-6">
                <Button color="danger" variant="light" className="font-bold" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  className="font-bold px-8 rounded-xl shadow-lg shadow-primary/20"
                  isLoading={isForgotLoading}
                >
                  Send Reset Link
                </Button>
              </ModalFooter>
            </Form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
