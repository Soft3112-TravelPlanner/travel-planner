import { Button, Chip } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [value, setValue] = useState(0);
  return (
    <>
      <div className="  flex items-center justify-center gap-4">
        <Chip>{value}</Chip>
        <Button onPress={() => setValue((v) => v + 1)}>Value: {value}</Button>
      </div>
    </>
  );
}
