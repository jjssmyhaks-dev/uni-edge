'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

interface OfferLetterProps {
  studentName: string;
  programName: string;
  departmentName: string;
  institutionName: string;
  admissionYear: string;
  seatNumber?: string;
  category?: string;
  issuedDate?: string;
}

export function OfferLetter({
  studentName,
  programName,
  departmentName,
  institutionName,
  admissionYear,
  seatNumber,
  category,
  issuedDate,
}: OfferLetterProps) {
  const date = issuedDate || new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 no-print">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button size="sm" onClick={handlePrint}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <div id="offer-letter" className="bg-white border-2 border-gray-300 p-8 max-w-2xl mx-auto" style={{ fontFamily: 'Times New Roman, serif' }}>
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{institutionName}</h1>
          <p className="text-sm text-gray-600 mt-1">Office of Admissions</p>
          <p className="text-sm text-gray-600">Admission Offer Letter — {admissionYear}</p>
        </div>

        {/* Reference */}
        <div className="flex justify-between mb-6 text-sm">
          <div>
            <span className="text-gray-500">Ref: </span>
            <span className="font-mono">AD/{admissionYear}/{seatNumber || '000'}</span>
          </div>
          <div>
            <span className="text-gray-500">Date: </span>
            <span>{date}</span>
          </div>
        </div>

        {/* Recipient */}
        <div className="mb-6">
          <p className="font-semibold">{studentName}</p>
          <p className="text-sm text-gray-600">Category: {category || 'General'}</p>
        </div>

        {/* Body */}
        <div className="space-y-4 text-sm leading-relaxed">
          <p>Dear {studentName},</p>

          <p>
            With reference to your application for admission to the{' '}
            <strong>{programName}</strong> program in the Department of{' '}
            <strong>{departmentName}</strong>, we are pleased to inform you that
            you have been offered admission for the academic year{' '}
            <strong>{admissionYear}</strong>.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
            <h3 className="font-semibold mb-2">Admission Details</h3>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-500 w-40">Program:</td>
                  <td className="py-1 font-medium">{programName}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-500">Department:</td>
                  <td className="py-1 font-medium">{departmentName}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-500">Academic Year:</td>
                  <td className="py-1 font-medium">{admissionYear}</td>
                </tr>
                {seatNumber && (
                  <tr>
                    <td className="py-1 text-gray-500">Seat Number:</td>
                    <td className="py-1 font-medium">{seatNumber}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-1 text-gray-500">Category:</td>
                  <td className="py-1 font-medium">{category || 'General'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            You are requested to confirm your acceptance of this offer by paying
            the admission confirmation fee and completing the enrollment process
            before the deadline. Failure to confirm within the stipulated time
            may result in cancellation of your admission.
          </p>

          <p>
            Please carry the following documents at the time of enrollment:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Original marksheets and certificates</li>
            <li>Transfer Certificate / Migration Certificate</li>
            <li>Category certificate (if applicable)</li>
            <li>Identity proof (Aadhaar / Passport)</li>
            <li>Passport-size photographs (6 copies)</li>
            <li>Admission confirmation fee receipt</li>
          </ul>

          <p>
            We congratulate you on your selection and look forward to welcoming
            you to our institution.
          </p>

          <p className="mt-4">
            Yours sincerely,
          </p>

          <div className="mt-8">
            <div className="border-t border-gray-400 w-48 pt-1">
              <p className="font-semibold">Dean of Admissions</p>
              <p className="text-xs text-gray-500">{institutionName}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>This is a computer-generated document. No signature is required.</p>
          <p>Generated by Uni-Edge • {date}</p>
        </div>
      </div>
    </div>
  );
}

interface BonafideCertificateProps {
  studentName: string;
  programName: string;
  departmentName: string;
  institutionName: string;
  enrollmentNumber: string;
  admissionYear: string;
  validFrom?: string;
  validUntil?: string;
}

export function BonafideCertificate({
  studentName,
  programName,
  departmentName,
  institutionName,
  enrollmentNumber,
  admissionYear,
  validFrom,
  validUntil,
}: BonafideCertificateProps) {
  const from = validFrom || admissionYear;
  const until = validUntil || `${parseInt(admissionYear) + 1}`;
  const date = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 no-print">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <div className="bg-white border-2 border-gray-300 p-8 max-w-2xl mx-auto" style={{ fontFamily: 'Times New Roman, serif' }}>
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">{institutionName}</h1>
          <p className="text-sm text-gray-600">Bonafide Certificate</p>
        </div>

        <div className="text-sm leading-relaxed space-y-4">
          <p className="text-right text-gray-500">Date: {date}</p>

          <p>To Whom It May Concern,</p>

          <p>
            This is to certify that <strong className="text-base">{studentName}</strong> is a bonafide
            student of this institution. He/She is admitted to the{' '}
            <strong>{programName}</strong> program in the Department of{' '}
            <strong>{departmentName}</strong> for the academic year {from}-{until}.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-500 w-40">Enrollment No:</td>
                  <td className="py-1 font-medium font-mono">{enrollmentNumber}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-500">Program:</td>
                  <td className="py-1 font-medium">{programName}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-500">Department:</td>
                  <td className="py-1 font-medium">{departmentName}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-500">Valid Period:</td>
                  <td className="py-1 font-medium">{from} to {until}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            This certificate is issued upon the request of the student for the purpose of
            <em> _________________________________</em>.
          </p>

          <p>
            This certificate is valid for the period mentioned above and is not transferable.
          </p>

          <div className="mt-12 flex justify-between">
            <div>
              <div className="border-t border-gray-400 w-40 pt-1">
                <p className="font-semibold text-sm">Head of Department</p>
                <p className="text-xs text-gray-500">{departmentName}</p>
              </div>
            </div>
            <div>
              <div className="border-t border-gray-400 w-40 pt-1 text-right">
                <p className="font-semibold text-sm">Registrar</p>
                <p className="text-xs text-gray-500">{institutionName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Generated by Uni-Edge • {date}</p>
        </div>
      </div>
    </div>
  );
}
