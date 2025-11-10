"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import EmailList from "./components/EmailList";
import EmailComposer from "./components/EmailComposer";
import EmailTabs from "./components/EmailTabs";

type EmailStatus = "ALL" | "DRAFT" | "SENDING" | "SENT" | "FAILED";

interface Email {
  id: string;
  subject: string;
  content: string;
  recipients: string[];
  cc: string[];
  bcc: string[];
  status: string;
  sentBy: string;
  sentByUser: {
    name: string | null;
    email: string;
    username: string;
  };
  sentAt: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MailPage() {
  const [activeTab, setActiveTab] = useState<EmailStatus>("ALL");
  const [page, setPage] = useState(1);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<Email | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["emails", activeTab, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (activeTab !== "ALL") {
        params.append("status", activeTab);
      }

      const response = await fetch(`/api/admin/mail?${params}`);
      if (!response.ok) throw new Error("Failed to fetch emails");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await fetch(`/api/admin/mail/${emailId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete email");
      return response.json();
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Email deleted successfully",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to delete email",
        color: "red",
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const response = await fetch("/api/admin/mail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId }),
      });
      if (!response.ok) throw new Error("Failed to send email");
      return response.json();
    },
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Email is being sent",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to send email",
        color: "red",
      });
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mail Management</h1>
        <div className="flex gap-2">
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
            variant="light"
          >
            Refresh
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsComposerOpen(true)}
          >
            Compose Email
          </Button>
        </div>
      </div>

      <EmailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <EmailList
        emails={data?.emails || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        currentPage={page}
        onPageChange={setPage}
        onDelete={(id) => deleteMutation.mutate(id)}
        onSend={(id) => sendMutation.mutate(id)}
        onEdit={(email) => {
          setEditingEmail(email);
          setIsComposerOpen(true);
        }}
      />

      <EmailComposer
        isOpen={isComposerOpen}
        editingEmail={editingEmail}
        onClose={() => {
          setIsComposerOpen(false);
          setEditingEmail(null);
        }}
        onSuccess={() => {
          setIsComposerOpen(false);
          setEditingEmail(null);
          queryClient.invalidateQueries({ queryKey: ["emails"] });
        }}
      />
    </div>
  );
}
