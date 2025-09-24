'use client';

import { Paper, Title, Table, Stack, Collapse, Group, ActionIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import styles from './Reference.module.css';

export function Reference() {
  const [simpleDCsOpened, { toggle: toggleSimpleDCs }] = useDisclosure(false);
  const [levelDCsOpened, { toggle: toggleLevelDCs }] = useDisclosure(false);
  const [spellDCsOpened, { toggle: toggleSpellDCs }] = useDisclosure(false);
  
  return (
    <div className={styles.container}>
      <Stack gap="xl">
        <Title order={2}>Pathfinder 2e Reference Materials</Title>
        
        <Paper p="lg" shadow="sm" withBorder className={styles.referenceTable}>
          <Group justify="space-between" style={{ cursor: 'pointer' }} onClick={toggleSimpleDCs}>
            <Title order={3}>Simple DCs</Title>
            <ActionIcon variant="subtle" size="sm">
              {simpleDCsOpened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          </Group>
          <Collapse in={simpleDCsOpened} mt="md">
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
          </Collapse>
        </Paper>

        <Paper p="lg" shadow="sm" withBorder className={styles.referenceTable}>
          <Group justify="space-between" style={{ cursor: 'pointer' }} onClick={toggleLevelDCs}>
            <Title order={3}>Level Based DCs</Title>
            <ActionIcon variant="subtle" size="sm">
              {levelDCsOpened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          </Group>
          <Collapse in={levelDCsOpened} mt="md">
            <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Level</Table.Th>
                <Table.Th>DC</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>0</Table.Td>
                <Table.Td>14</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>1</Table.Td>
                <Table.Td>15</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>2</Table.Td>
                <Table.Td>16</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>3</Table.Td>
                <Table.Td>18</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>4</Table.Td>
                <Table.Td>19</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>5</Table.Td>
                <Table.Td>20</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>6</Table.Td>
                <Table.Td>22</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>7</Table.Td>
                <Table.Td>23</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>8</Table.Td>
                <Table.Td>24</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>9</Table.Td>
                <Table.Td>26</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>10</Table.Td>
                <Table.Td>27</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>11</Table.Td>
                <Table.Td>28</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>12</Table.Td>
                <Table.Td>30</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>13</Table.Td>
                <Table.Td>31</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>14</Table.Td>
                <Table.Td>32</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>15</Table.Td>
                <Table.Td>34</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>16</Table.Td>
                <Table.Td>35</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>17</Table.Td>
                <Table.Td>36</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>18</Table.Td>
                <Table.Td>38</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>19</Table.Td>
                <Table.Td>39</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>20</Table.Td>
                <Table.Td>40</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>21</Table.Td>
                <Table.Td>42</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>22</Table.Td>
                <Table.Td>44</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>23</Table.Td>
                <Table.Td>46</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>24</Table.Td>
                <Table.Td>48</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>25</Table.Td>
                <Table.Td>50</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
          </Collapse>
        </Paper>

        <Paper p="lg" shadow="sm" withBorder className={styles.referenceTable}>
          <Group justify="space-between" style={{ cursor: 'pointer' }} onClick={toggleSpellDCs}>
            <Title order={3}>Spell DCs</Title>
            <ActionIcon variant="subtle" size="sm">
              {spellDCsOpened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </ActionIcon>
          </Group>
          <Collapse in={spellDCsOpened} mt="md">
            <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Spell Rank*</Table.Th>
                <Table.Th>DC</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>1st</Table.Td>
                <Table.Td>15</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>2nd</Table.Td>
                <Table.Td>18</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>3rd</Table.Td>
                <Table.Td>20</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>4th</Table.Td>
                <Table.Td>23</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>5th</Table.Td>
                <Table.Td>26</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>6th</Table.Td>
                <Table.Td>28</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>7th</Table.Td>
                <Table.Td>31</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>8th</Table.Td>
                <Table.Td>34</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>9th</Table.Td>
                <Table.Td>36</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>10th</Table.Td>
                <Table.Td>39</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
          </Collapse>
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