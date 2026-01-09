import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { API_URL } from "../config";
import { type UserType } from "../types";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Dialog } from "../components/dialog";
import { SignUp } from "../components/SignUp";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [data, setData] = useState<{
    users: UserType[];
  }>();
  const [openConfirm, setOpenConfirm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`${API_URL}/auth/users`).then((res) =>
        res.json()
      );
      console.log(res);
      setData(res);
    }
    fetchData();
  }, []);
  return (
    <div
      className="dark bg-background text-foreground min-h-screen w-full "
      style={{ padding: "1rem" }}
    >
      <SignUp />

      <h1 className=" text-red-500 font-bold"> Data Should be like this : </h1>
      <ConfirmDialog
        open={openConfirm}
        title="Confirm Action"
        onConfirm={() => {
          setOpenConfirm(false);
        }}
        onCancel={() => {
          setOpenConfirm(false);
        }}
      />

      <button
        onClick={() => {
          setOpenConfirm(true);
        }}
      >
        Open Dialog
      </button>

      <Dialog
        open={openConfirm}
        onClose={() => {
          setOpenConfirm(false);
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", textAlign: "left" }}>
            Confirm Action
          </h2>
          <p style={{ margin: 0, color: "#666", textAlign: "left" }}>
            Are you sure you want to proceed with this action? This cannot be
            undone.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              marginTop: "1rem",
            }}
          >
            <button
              onClick={() => setOpenConfirm(false)}
              style={{
                background: "transparent",
                color: "inherit",
                border: "1px solid #ccc",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => setOpenConfirm(false)}
              style={{
                background: "#646cff",
                color: "white",
                border: "none",
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </Dialog>
      {data?.users.map((user) => (
        <div
          onClick={() => {
            setOpenConfirm(true);
          }}
        >
          {user.email}
        </div>
      ))}
    </div>
  );
}
