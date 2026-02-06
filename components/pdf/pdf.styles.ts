import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  studentInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  studentEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  attempt: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 15,
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f3f4f6',
  },
  scoreBox: {
    textAlign: 'center',
    marginHorizontal: 20,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  passed: {
    color: '#16a34a',
  },
  failed: {
    color: '#dc2626',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 20,
  },
  question: {
    fontSize: 12,
    fontWeight: 500,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
    padding: 2,
  },
  answer: {
    // backgroundColor: '#BBE0EF',
    borderBottom: '2 solid #4C763B',  // green-300
    // color: '#065f46',           // green-800
    padding: 5,
    marginBottom: 4,
    borderRadius: 4,
    fontWeight: 'bold',
  },
  questionBlock: {
    marginBottom: 15,
    padding: 10,
    border: '1px solid #e5e7eb',
    borderRadius: 5,
  },
  questionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.4,
  },
  answerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 3,
  },
  correctAnswer: {
    fontSize: 11,
    color: '#16a34a',
    backgroundColor: '#f0fdf4',
    padding: 5,
    marginBottom: 5,
  },
  wrongAnswer: {
    fontSize: 11,
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: 5,
    marginBottom: 5,
  },
  neutralAnswer: {
    fontSize: 11,
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    padding: 5,
    marginBottom: 5,
  },
  explanation: {
    fontSize: 11,
    color: '#1e40af',
    backgroundColor: '#eff6ff',
    padding: 5,
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
  },
});