'use client';

import { Paper, Title, Table, Stack } from '@mantine/core';
import styles from './Reference.module.css';

export function Reference() {
  return (
    <div className={styles.container}>
      <Stack gap="xl">
        <Title order={2}>Pathfinder 2e Reference Materials</Title>
        
        <Paper p="lg" shadow="sm" withBorder className={styles.referenceTable}>
          <Title order={3} mb="md">Simple DCs</Title>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Proficiency Rank</Table.Th>
                <Table.Th>DC</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>Untrained</Table.Td>
                <Table.Td>10</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Trained</Table.Td>
                <Table.Td>15</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Expert</Table.Td>
                <Table.Td>20</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Master</Table.Td>
                <Table.Td>30</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>Legendary</Table.Td>
                <Table.Td>40</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Paper>

        {/* Placeholder for future reference materials */}
        <Paper p="lg" shadow="sm" withBorder className={styles.placeholder}>
          <Title order={4} c="dimmed">Additional Reference Materials</Title>
          <p>More reference tables and materials will be added here as specified.</p>
        </Paper>
      </Stack>
    </div>
  );
}