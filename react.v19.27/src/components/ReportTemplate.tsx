import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, paddingBottom: 60 },
  logos: { width: 140, height: 30, marginBottom: 10 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  row: { flexDirection: 'row', borderBottom: '1px solid #EEE', padding: 5 },
  cell: { flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey',
  },
});


export const ReportTemplate = ({ products }: { products: any[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerContainer}>
        <View>
        <Image 
          src={'/images/logo.png'}
          style={styles.logos} 
        />

          <Text style={styles.headerTitle}>Product Report</Text>
          <Text style={{ fontSize: 10, color: '#666' }}>Generated on {new Date().toLocaleDateString()}</Text>
        </View>
        
      </View>

      <View style={[styles.row, { backgroundColor: '#f0f0f0' }]}>
        <Text style={{ width: 30, fontWeight: 'bold' }}>ID</Text>         
        <Text style={{ flex: 2, fontWeight: 'bold' }}>Description</Text>
        <Text style={{ fontWeight: 'bold', width: 50 }}>Stocks</Text>
        <Text style={{ fontWeight: 'bold', width: 50 }}>Unit</Text>
        <Text style={{ fontWeight: 'bold', width: 100 }}>Price</Text>
      </View>

      {products.map((p) => (
        <View key={p.id} style={styles.row} wrap={false}>
          <Text style={{ width: 30}}>{p.id}</Text>
          <Text style={{ flex: 2, width: 100 }}>{p.descriptions}</Text>
          <Text style={{ width: 50}}>{p.qty}</Text>
          <Text style={{ width: 50}}>{p.unit}</Text>
          <Text style={{ width: 100}}>
            ${Number(p.sellprice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      ))}

      {/* Pagination Footer */}
      <Text 
        style={styles.footer} 
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
        fixed 
      />
    </Page>
  </Document>
);