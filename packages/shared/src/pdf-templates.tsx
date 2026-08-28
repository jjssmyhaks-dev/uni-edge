import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '2 solid #1e293b',
    alignItems: 'center',
  },
  institutionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
    color: '#1e293b',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#334155',
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: '#64748b',
    fontSize: 10,
    width: '40%',
  },
  value: {
    fontSize: 11,
    fontWeight: 'bold',
    width: '55%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderBottom: '1 solid #e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '1 solid #f1f5f9',
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 10,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '1 solid #e2e8f0',
    alignItems: 'center',
  },
  signature: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    width: '40%',
    borderTop: '1 solid #1a1a1a',
    paddingTop: 5,
    alignItems: 'center',
  },
  stamp: {
    width: 80,
    height: 80,
    border: '2 solid #ef4444',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 40,
    top: 40,
  },
  watermark: {
    position: 'absolute',
    fontSize: 60,
    color: '#f1f5f9',
    transform: 'rotate(-45deg)',
    top: '40%',
    left: '15%',
  },
  photo: {
    width: 80,
    height: 100,
    border: '1 solid #e2e8f0',
    marginBottom: 10,
  },
});

// ============================================
// HALL TICKET
// ============================================

export interface HallTicketData {
  institution_name: string;
  institution_address: string;
  exam_name: string;
  exam_date: string;
  exam_time: string;
  duration_minutes: number;
  venue: string;
  student_name: string;
  enrollment_number: string;
  roll_number: string;
  program: string;
  semester: string;
  seat_number: string;
  ticket_number: string;
}

export function HallTicketPDF({ data }: { data: HallTicketData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>HALL TICKET</Text>

        <View style={styles.header}>
          <Text style={styles.institutionName}>{data.institution_name}</Text>
          <Text style={styles.subtitle}>{data.institution_address}</Text>
        </View>

        <Text style={styles.title}>EXAMINATION HALL TICKET</Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Exam:</Text>
            <Text style={styles.value}>{data.exam_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{data.exam_date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>{data.exam_time} ({data.duration_minutes} minutes)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Venue:</Text>
            <Text style={styles.value}>{data.venue}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Candidate Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{data.student_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Enrollment No:</Text>
            <Text style={styles.value}>{data.enrollment_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Roll Number:</Text>
            <Text style={styles.value}>{data.roll_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Program:</Text>
            <Text style={styles.value}>{data.program}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Semester:</Text>
            <Text style={styles.value}>{data.semester}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Seat Number:</Text>
            <Text style={styles.value}>{data.seat_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Ticket Number:</Text>
            <Text style={styles.value}>{data.ticket_number}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={{ fontSize: 9, marginBottom: 3 }}>1. Carry this hall ticket and a valid photo ID to the exam hall.</Text>
          <Text style={{ fontSize: 9, marginBottom: 3 }}>2. Report to the exam hall 30 minutes before the exam starts.</Text>
          <Text style={{ fontSize: 9, marginBottom: 3 }}>3. Electronic devices (phones, calculators) are strictly prohibited.</Text>
          <Text style={{ fontSize: 9, marginBottom: 3 }}>4. This hall ticket is non-transferable.</Text>
        </View>

        <View style={styles.signature}>
          <View style={styles.signatureLine}>
            <Text style={{ fontSize: 9 }}>Controller of Examinations</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text style={{ fontSize: 9 }}>Candidate Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ============================================
// OFFER LETTER
// ============================================

export interface OfferLetterData {
  institution_name: string;
  institution_address: string;
  date: string;
  reference_number: string;
  student_name: string;
  program_name: string;
  department: string;
  duration: string;
  total_seats: number;
  merit_rank: number;
  category: string;
  admission_fee: number;
  confirmation_deadline: string;
  principal_name: string;
}

export function OfferLetterPDF({ data }: { data: OfferLetterData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.institution_name}>{data.institution_name}</Text>
          <Text style={styles.subtitle}>{data.institution_address}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 10, color: '#64748b' }}>Ref: {data.reference_number}</Text>
          </View>
          <Text style={{ fontSize: 10 }}>{data.date}</Text>
        </View>

        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 15 }}>OFFER OF ADMISSION</Text>

        <Text style={{ marginBottom: 10, fontSize: 11 }}>
          Dear {data.student_name},
        </Text>

        <Text style={{ marginBottom: 10, fontSize: 11, lineHeight: 1.6 }}>
          We are pleased to inform you that you have been offered admission to the{' '}
          <Text style={{ fontWeight: 'bold' }}>{data.program_name}</Text> program in the{' '}
          Department of {data.department} for the academic session 2026-2027.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admission Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Program:</Text>
            <Text style={styles.value}>{data.program_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.value}>{data.department}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>{data.duration}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Merit Rank:</Text>
            <Text style={styles.value}>{data.merit_rank} (Category: {data.category})</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Admission Fee:</Text>
            <Text style={styles.value}>₹{data.admission_fee.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Confirm By:</Text>
            <Text style={styles.value}>{data.confirmation_deadline}</Text>
          </View>
        </View>

        <Text style={{ marginBottom: 10, fontSize: 11, lineHeight: 1.6 }}>
          To confirm your seat, please pay the admission fee and upload the payment receipt
          through the student portal before {data.confirmation_deadline}. Failure to confirm
          by the deadline will result in forfeiture of your seat, and it will be offered to
          the next candidate on the waiting list.
        </Text>

        <Text style={{ marginBottom: 10, fontSize: 11 }}>
          We look forward to welcoming you to our institution.
        </Text>

        <View style={styles.signature}>
          <View style={styles.signatureLine}>
            <Text style={{ fontSize: 9 }}>{data.principal_name}</Text>
            <Text style={{ fontSize: 8, color: '#64748b' }}>Principal</Text>
          </View>
          <View style={[styles.signatureLine, { alignItems: 'flex-end' }]}>
            <Text style={{ fontSize: 9 }}>Dean of Admissions</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ============================================
// TRANSCRIPT / GRADE REPORT
// ============================================

export interface TranscriptData {
  institution_name: string;
  institution_address: string;
  student_name: string;
  enrollment_number: string;
  program: string;
  department: string;
  date_of_birth: string;
  admission_date: string;
  semesters: {
    term_label: string;
    courses: {
      course_code: string;
      course_name: string;
      credits: number;
      grade: string;
      grade_points: number;
    }[];
    sgpa: number;
  }[];
  cgpa: number;
  total_credits: number;
  issue_date: string;
  transcript_number: string;
}

export function TranscriptPDF({ data }: { data: TranscriptData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>TRANSCRIPT</Text>

        <View style={styles.header}>
          <Text style={styles.institution_name}>{data.institution_name}</Text>
          <Text style={styles.subtitle}>{data.institution_address}</Text>
        </View>

        <Text style={styles.title}>ACADEMIC TRANSCRIPT</Text>
        <Text style={{ textAlign: 'center', fontSize: 9, color: '#64748b', marginBottom: 15 }}>
          Transcript No: {data.transcript_number} | Issued: {data.issue_date}
        </Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Student Name:</Text>
            <Text style={styles.value}>{data.student_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Enrollment No:</Text>
            <Text style={styles.value}>{data.enrollment_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Program:</Text>
            <Text style={styles.value}>{data.program}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.value}>{data.department}</Text>
          </View>
        </View>

        {data.semesters.map((sem, si) => (
          <View key={si} style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#1e293b' }}>
              {sem.term_label} — SGPA: {sem.sgpa.toFixed(2)}
            </Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, { width: '15%' }]}>Code</Text>
              <Text style={[styles.tableCellHeader, { width: '40%' }]}>Course</Text>
              <Text style={[styles.tableCellHeader, { width: '12%', textAlign: 'center' }]}>Credits</Text>
              <Text style={[styles.tableCellHeader, { width: '15%', textAlign: 'center' }]}>Grade</Text>
              <Text style={[styles.tableCellHeader, { width: '18%', textAlign: 'center' }]}>Grade Points</Text>
            </View>
            {sem.courses.map((course, ci) => (
              <View key={ci} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '15%' }]}>{course.course_code}</Text>
                <Text style={[styles.tableCell, { width: '40%' }]}>{course.course_name}</Text>
                <Text style={[styles.tableCell, { width: '12%', textAlign: 'center' }]}>{course.credits}</Text>
                <Text style={[styles.tableCell, { width: '15%', textAlign: 'center', fontWeight: 'bold' }]}>{course.grade}</Text>
                <Text style={[styles.tableCell, { width: '18%', textAlign: 'center' }]}>{course.grade_points.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={{ borderTop: '2 solid #1e293b', paddingTop: 10, marginTop: 10 }}>
          <View style={styles.row}>
            <Text style={[styles.label, { fontWeight: 'bold' }]}>Cumulative GPA (CGPA):</Text>
            <Text style={[styles.value, { fontSize: 14 }]}>{data.cgpa.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Credits Earned:</Text>
            <Text style={styles.value}>{data.total_credits}</Text>
          </View>
        </View>

        <View style={styles.signature}>
          <View style={styles.signatureLine}>
            <Text style={{ fontSize: 9 }}>Registrar</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text style={{ fontSize: 9 }}>Controller of Examinations</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ============================================
// FEE RECEIPT
// ============================================

export interface FeeReceiptData {
  institution_name: string;
  institution_address: string;
  receipt_number: string;
  date: string;
  student_name: string;
  enrollment_number: string;
  program: string;
  fee_type: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  academic_year: string;
  semester: string;
}

export function FeeReceiptPDF({ data }: { data: FeeReceiptData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.institution_name}>{data.institution_name}</Text>
          <Text style={styles.subtitle}>{data.institution_address}</Text>
        </View>

        <Text style={styles.title}>FEE PAYMENT RECEIPT</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          <View>
            <Text style={{ fontSize: 10, color: '#64748b' }}>Receipt No: {data.receipt_number}</Text>
          </View>
          <Text style={{ fontSize: 10 }}>{data.date}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Student Name:</Text>
            <Text style={styles.value}>{data.student_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Enrollment No:</Text>
            <Text style={styles.value}>{data.enrollment_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Program:</Text>
            <Text style={styles.value}>{data.program}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Academic Year:</Text>
            <Text style={styles.value}>{data.academic_year}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Semester:</Text>
            <Text style={styles.value}>{data.semester}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Fee Type:</Text>
            <Text style={styles.value}>{data.fee_type}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Amount Paid:</Text>
            <Text style={[styles.value, { fontSize: 14, color: '#16a34a' }]}>₹{data.amount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>{data.payment_method}</Text>
          </View>
          {data.transaction_id && (
            <View style={styles.row}>
              <Text style={styles.label}>Transaction ID:</Text>
              <Text style={styles.value}>{data.transaction_id}</Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: 30, padding: 15, backgroundColor: '#f8fafc', borderRadius: 4, border: '1 solid #e2e8f0' }}>
          <Text style={{ fontSize: 9, color: '#64748b', textAlign: 'center' }}>
            This is a computer-generated receipt and does not require a physical signature.
            For any queries, contact the accounts department.
          </Text>
        </View>

        <View style={styles.signature}>
          <View style={styles.signatureLine}>
            <Text style={{ fontSize: 9 }}>Accounts Officer</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text style={{ fontSize: 9 }}>Student Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
