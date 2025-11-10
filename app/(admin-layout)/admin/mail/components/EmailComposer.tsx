"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  MultiSelect,
  Switch,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import { IconSend, IconDeviceFloppy } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingEmail?: {
    id: string;
    subject: string;
    content: string;
    recipients: string[];
    cc: string[];
    bcc: string[];
  } | null;
}

export default function EmailComposer({
  isOpen,
  onClose,
  onSuccess,
  editingEmail,
}: EmailComposerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [sendToAllUsers, setSendToAllUsers] = useState(false);

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users-search", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "100",
      });
      if (debouncedSearch) {
        params.append("q", debouncedSearch);
      }
      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    enabled: isOpen && !sendToAllUsers,
  });

  const form = useForm({
    initialValues: {
      subject: editingEmail?.subject || "",
      content: editingEmail?.content || "",
      recipients: editingEmail?.recipients || ([] as string[]),
      cc: editingEmail?.cc || ([] as string[]),
      bcc: editingEmail?.bcc || ([] as string[]),
      sendNow: false,
      sendToAllUsers: false,
    },
    validate: {
      subject: (value) => (!value ? "Subject is required" : null),
      content: (value) => (!value ? "Content is required" : null),
      recipients: (value, values) =>
        !values.sendToAllUsers && value.length === 0
          ? "At least one recipient is required"
          : null,
    },
  });

  const userOptions = useMemo(
    () =>
      usersData?.users?.map((user: any) => ({
        value: user.email,
        label: `${user.name || user.username} (${user.email})`,
      })) || [],
    [usersData]
  );

  useEffect(() => {
    if (editingEmail) {
      form.setValues({
        subject: editingEmail.subject,
        content: editingEmail.content,
        recipients: editingEmail.recipients,
        cc: editingEmail.cc,
        bcc: editingEmail.bcc,
        sendNow: false,
        sendToAllUsers: false,
      });
      setSendToAllUsers(false);
    } else {
      form.reset();
      setSendToAllUsers(false);
    }
  }, [editingEmail]);

  useEffect(() => {
    if (sendToAllUsers) {
      form.setFieldValue("recipients", []);
      form.setFieldValue("cc", []);
      form.setFieldValue("bcc", []);
    }
  }, [sendToAllUsers]);

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);
    try {
      let response;
      
      const payload = {
        ...values,
        sendToAllUsers,
      };
      
      if (editingEmail) {
        // Update existing email
        response = await fetch(`/api/admin/mail/${editingEmail.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new email
        response = await fetch("/api/admin/mail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error(editingEmail ? "Failed to update email" : "Failed to create email");

      notifications.show({
        title: "Success",
        message: editingEmail 
          ? "Email updated successfully"
          : sendToAllUsers
          ? values.sendNow
            ? "Email is being sent to all users"
            : "Email saved as draft (will be sent to all users)"
          : values.sendNow
          ? "Email is being sent"
          : "Email saved as draft",
        color: "green",
      });

      form.reset();
      setSendToAllUsers(false);
      onSuccess();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: editingEmail ? "Failed to update email" : "Failed to create email",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={editingEmail ? "Edit Email" : "Compose Email"}
      size="lg"
      closeOnClickOutside={false}
    >
      <LoadingOverlay visible={isSubmitting} />

      <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
        <Switch
          label="Send to all users (except admins)"
          description="When enabled, email will be sent as BCC to all non-admin users"
          checked={sendToAllUsers}
          onChange={(event) => setSendToAllUsers(event.currentTarget.checked)}
          mb="md"
        />

        {!sendToAllUsers && (
          <>
            <MultiSelect
              label="Recipients (To)"
              placeholder="Search and select recipients"
              data={userOptions}
              searchable
              required
              onSearchChange={setSearchQuery}
              searchValue={searchQuery}
              disabled={isLoadingUsers}
              {...form.getInputProps("recipients")}
            />

            <MultiSelect
              label="CC (Carbon Copy)"
              placeholder="Search and select CC recipients"
              data={userOptions}
              searchable
              onSearchChange={setSearchQuery}
              searchValue={searchQuery}
              disabled={isLoadingUsers}
              {...form.getInputProps("cc")}
            />

            <MultiSelect
              label="BCC (Blind Carbon Copy)"
              placeholder="Search and select BCC recipients"
              data={userOptions}
              searchable
              onSearchChange={setSearchQuery}
              searchValue={searchQuery}
              disabled={isLoadingUsers}
              {...form.getInputProps("bcc")}
            />
          </>
        )}

        <TextInput
          label="Subject"
          placeholder="Enter email subject"
          required
          {...form.getInputProps("subject")}
        />

        <Textarea
          label="Content"
          placeholder="Enter email content (HTML supported)"
          required
          minRows={10}
          {...form.getInputProps("content")}
        />

        {!editingEmail && (
          <Switch
            label="Send immediately"
            description="If unchecked, email will be saved as draft"
            {...form.getInputProps("sendNow", { type: "checkbox" })}
          />
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            leftSection={
              editingEmail ? (
                <IconDeviceFloppy size={16} />
              ) : form.values.sendNow ? (
                <IconSend size={16} />
              ) : (
                <IconDeviceFloppy size={16} />
              )
            }
          >
            {editingEmail 
              ? "Update Draft" 
              : form.values.sendNow 
              ? "Send Email" 
              : "Save Draft"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
