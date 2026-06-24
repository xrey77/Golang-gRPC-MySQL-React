import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  section: { margin: 10, padding: 10 },
  header: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', padding: 5 },
  tableCell: { flex: 1 }
});

// Template for Category Report (Details)
export const CategoryReport = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Category: {data.name}</Text>
      <View style={styles.section}>
        <Text>Products in this category:</Text>
        {data.products?.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.name}</Text>
            <Text style={styles.tableCell}>Price: ${item.price}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
