"use client";

import { Table, Badge, Button, Pagination, LoadingOverlay } from "@mantine/core";
import { IconTrash, IconSend, IconEye, IconEdit } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState } from "react";
import EmailDetailModal from "./EmailDetailModal";

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

interface EmailListProps {
  emails: Email[];
  isLoading: boolean;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  currentPage: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onSend: (id: string) => void;
  onEdit: (email: Email) => void;
}

const statusColors: Record<string, string> = {
  DRAFT: "gray",
  SENDING: "blue",
  SENT: "green",
  FAILED: "red",
};

export default function EmailList({
  emails,
  isLoading,
  pagination,
  currentPage,
  onPageChange,
  onDelete,
  onSend,
  onEdit,
}: EmailListProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  return (
    <div className="relative">
      <LoadingOverlay visible={isLoading} />

      {emails.length === 0 && !isLoading ? (
        <div className="text-center py-12 text-gray-500">
          No emails found
        </div>
      ) : (
        <>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Subject</Table.Th>
                <Table.Th>Recipients</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Sent By</Table.Th>
                <Table.Th>Created At</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {emails.map((email) => (
                <Table.Tr key={email.id}>
                  <Table.Td className="font-medium">{email.subject}</Table.Td>
                  <Table.Td>
                    {email.recipients.length === 0 && email.cc.length === 0 && email.bcc.length > 0 ? (
                      <div className="text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          📧 All Users ({email.bcc.length})
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <div>To: {email.recipients.length}</div>
                        {email.cc.length > 0 && <div>CC: {email.cc.length}</div>}
                        {email.bcc.length > 0 && <div>BCC: {email.bcc.length}</div>}
                      </div>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusColors[email.status]}>
                      {email.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {email.sentByUser.name || email.sentByUser.username}
                  </Table.Td>
                  <Table.Td>
                    {format(new Date(email.createdAt), "MMM dd, yyyy HH:mm")}
                  </Table.Td>
                  <Table.Td>
                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        variant="light"
                        color="blue"
                        leftSection={<IconEye size={14} />}
                        onClick={() => setSelectedEmail(email)}
                      >
                        View
                      </Button>
                      {email.status === "DRAFT" && (
                        <>
                          <Button
                            size="xs"
                            variant="light"
                            color="yellow"
                            leftSection={<IconEdit size={14} />}
                            onClick={() => onEdit(email)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="xs"
                            variant="light"
                            color="green"
                            leftSection={<IconSend size={14} />}
                            onClick={() => onSend(email.id)}
                          >
                            Send
                          </Button>
                        </>
                      )}
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => onDelete(email.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                total={pagination.totalPages}
                value={currentPage}
                onChange={onPageChange}
              />
            </div>
          )}
        </>
      )}

      <EmailDetailModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />
    </div>
  );
}
