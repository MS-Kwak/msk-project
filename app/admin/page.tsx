'use client';

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import { getContacts } from '@/actions/contact.action';
import { useQuery } from '@tanstack/react-query';

export default function AdminPage() {
  const contactsQuery = useQuery({
    queryKey: ['contact'],
    queryFn: () => getContacts(),
  });

  return (
    <Paper sx={{ padding: 2 }}>
      <h2>문의 내용 관리</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>번호</TableCell>
            <TableCell>이름</TableCell>
            <TableCell>연락처</TableCell>
            <TableCell>이메일</TableCell>
            <TableCell>내용</TableCell>
            <TableCell>작성일시</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contactsQuery.data &&
            contactsQuery.data.map((contact, index) => (
              <TableRow key={contact.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.description}</TableCell>
                <TableCell>
                  {new Date(contact.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
