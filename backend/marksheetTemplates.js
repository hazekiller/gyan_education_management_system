// Pre-built marksheet templates for schools and colleges

const templates = {
    schoolMarksheet: `
    <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 210mm; margin: 0 auto; background: white;">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 3px double #333; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0; color: #1a365d; font-size: 32px; text-transform: uppercase; letter-spacing: 2px;">
          {{school_name}}
        </h1>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">{{school_address}}</p>
        <p style="margin: 5px 0; color: #666; font-size: 14px;">Phone: {{school_phone}} | Email: {{school_email}}</p>
        <h2 style="margin: 20px 0 10px; color: #2d3748; font-size: 24px; text-transform: uppercase;">
          Academic Progress Report
        </h2>
        <p style="margin: 0; color: #666; font-size: 14px;">Academic Year: {{academic_year}}</p>
      </div>

      <!-- Student Information -->
      <div style="margin-bottom: 30px; background: #f7fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3182ce;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; width: 25%;"><strong>Student Name:</strong></td>
            <td style="padding: 8px 0; width: 25%;">{{student_name}}</td>
            <td style="padding: 8px 0; width: 25%;"><strong>Roll Number:</strong></td>
            <td style="padding: 8px 0; width: 25%;">{{roll_number}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Class:</strong></td>
            <td style="padding: 8px 0;">{{class}}</td>
            <td style="padding: 8px 0;"><strong>Section:</strong></td>
            <td style="padding: 8px 0;">{{section}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Admission No:</strong></td>
            <td style="padding: 8px 0;">{{admission_number}}</td>
            <td style="padding: 8px 0;"><strong>Examination:</strong></td>
            <td style="padding: 8px 0;">{{exam_name}}</td>
          </tr>
        </table>
      </div>

      <!-- Marks Table -->
      <div style="margin-bottom: 30px;">
        <h3 style="color: #2d3748; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #3182ce; padding-bottom: 8px;">
          Academic Performance
        </h3>
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #333;">
          <thead>
            <tr style="background: #3182ce; color: white;">
              <th style="border: 1px solid #333; padding: 12px; text-align: left;">S.No</th>
              <th style="border: 1px solid #333; padding: 12px; text-align: left;">Subject</th>
              <th style="border: 1px solid #333; padding: 12px; text-align: center;">Max Marks</th>
              <th style="border: 1px solid #333; padding: 12px; text-align: center;">Marks Obtained</th>
              <th style="border: 1px solid #333; padding: 12px; text-align: center;">Grade</th>
            </tr>
          </thead>
          <tbody>
            {{marks_table}}
          </tbody>
          <tfoot>
            <tr style="background: #edf2f7; font-weight: bold;">
              <td colspan="2" style="border: 1px solid #333; padding: 12px; text-align: right;">Total:</td>
              <td style="border: 1px solid #333; padding: 12px; text-align: center;">{{total_max_marks}}</td>
              <td style="border: 1px solid #333; padding: 12px; text-align: center;">{{total_marks}}</td>
              <td style="border: 1px solid #333; padding: 12px; text-align: center;">-</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Result Summary -->
      <div style="margin-bottom: 30px; display: flex; gap: 20px;">
        <div style="flex: 1; background: #f7fafc; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e0;">
          <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Percentage</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #3182ce;">{{percentage}}%</p>
        </div>
        <div style="flex: 1; background: #f7fafc; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e0;">
          <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Overall Grade</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #2d3748;">{{grade}}</p>
        </div>
        <div style="flex: 1; background: #f7fafc; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e0;">
          <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Result</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold; color: {{result_status === 'PASS' ? '#38a169' : '#e53e3e'}};">{{result_status}}</p>
        </div>
      </div>

      <!-- Grading Scale -->
      <div style="margin-bottom: 30px; background: #f7fafc; padding: 15px; border-radius: 8px;">
        <h4 style="margin: 0 0 10px; color: #2d3748; font-size: 14px;">Grading Scale:</h4>
        <table style="width: 100%; font-size: 12px;">
          <tr>
            <td><strong>A+ (90-100)</strong> - Outstanding</td>
            <td><strong>A (80-89)</strong> - Excellent</td>
            <td><strong>B+ (70-79)</strong> - Very Good</td>
            <td><strong>B (60-69)</strong> - Good</td>
          </tr>
          <tr>
            <td><strong>C+ (50-59)</strong> - Satisfactory</td>
            <td><strong>C (40-49)</strong> - Acceptable</td>
            <td><strong>D (33-39)</strong> - Needs Improvement</td>
            <td><strong>F (Below 33)</strong> - Fail</td>
          </tr>
        </table>
      </div>

      <!-- Remarks -->
      <div style="margin-bottom: 30px;">
        <h4 style="margin: 0 0 10px; color: #2d3748;">Teacher's Remarks:</h4>
        <div style="border: 1px solid #cbd5e0; padding: 15px; min-height: 60px; border-radius: 4px; background: white;">
          {{teacher_remarks}}
        </div>
      </div>

      <!-- Signatures -->
      <div style="margin-top: 50px; display: flex; justify-content: space-between;">
        <div style="text-align: center; flex: 1;">
          <div style="border-top: 2px solid #333; padding-top: 8px; margin-top: 60px; display: inline-block; min-width: 150px;">
            <strong>Class Teacher</strong>
          </div>
        </div>
        <div style="text-align: center; flex: 1;">
          <div style="border-top: 2px solid #333; padding-top: 8px; margin-top: 60px; display: inline-block; min-width: 150px;">
            <strong>Principal</strong>
          </div>
        </div>
        <div style="text-align: center; flex: 1;">
          <div style="border-top: 2px solid #333; padding-top: 8px; margin-top: 60px; display: inline-block; min-width: 150px;">
            <strong>Parent/Guardian</strong>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; text-align: center; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 12px; color: #666;">
        <p style="margin: 0;">This is a computer-generated document. Date of Issue: {{issue_date}}</p>
      </div>
    </div>
  `,

    collegeTranscript: `
    <div style="font-family: 'Times New Roman', serif; padding: 40px; max-width: 210mm; margin: 0 auto; background: white;">
      <!-- Header with Logo Space -->
      <div style="text-align: center; border: 3px solid #1a365d; padding: 30px; margin-bottom: 30px; background: linear-gradient(to bottom, #f7fafc, white);">
        <div style="width: 80px; height: 80px; margin: 0 auto 15px; border: 2px solid #1a365d; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: white;">
          <span style="font-size: 36px; color: #1a365d; font-weight: bold;">{{college_logo}}</span>
        </div>
        <h1 style="margin: 0; color: #1a365d; font-size: 28px; text-transform: uppercase; letter-spacing: 3px; font-weight: bold;">
          {{college_name}}
        </h1>
        <p style="margin: 8px 0 0; color: #4a5568; font-size: 13px; font-style: italic;">{{college_affiliation}}</p>
        <p style="margin: 5px 0; color: #666; font-size: 12px;">{{college_address}}</p>
        <div style="margin-top: 20px; padding: 10px; background: #1a365d; color: white; display: inline-block; border-radius: 4px;">
          <h2 style="margin: 0; font-size: 20px; letter-spacing: 2px;">ACADEMIC TRANSCRIPT</h2>
        </div>
      </div>

      <!-- Student Information -->
      <div style="margin-bottom: 25px; border: 2px solid #cbd5e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #2d3748; color: white; padding: 10px 20px;">
          <h3 style="margin: 0; font-size: 16px; letter-spacing: 1px;">STUDENT INFORMATION</h3>
        </div>
        <div style="padding: 20px; background: #f7fafc;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; width: 25%; font-weight: bold;">Name:</td>
              <td style="padding: 8px 0; width: 25%;">{{student_name}}</td>
              <td style="padding: 8px 0; width: 25%; font-weight: bold;">Registration No:</td>
              <td style="padding: 8px 0; width: 25%;">{{registration_number}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Program:</td>
              <td style="padding: 8px 0;">{{program_name}}</td>
              <td style="padding: 8px 0; font-weight: bold;">Semester:</td>
              <td style="padding: 8px 0;">{{semester}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Academic Year:</td>
              <td style="padding: 8px 0;">{{academic_year}}</td>
              <td style="padding: 8px 0; font-weight: bold;">Session:</td>
              <td style="padding: 8px 0;">{{session}}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Semester Results -->
      <div style="margin-bottom: 25px;">
        <div style="background: #2d3748; color: white; padding: 10px 20px; border-radius: 4px 4px 0 0;">
          <h3 style="margin: 0; font-size: 16px; letter-spacing: 1px;">SEMESTER PERFORMANCE</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #2d3748;">
          <thead>
            <tr style="background: #4a5568; color: white;">
              <th style="border: 1px solid #2d3748; padding: 12px; text-align: left; font-size: 13px;">Course Code</th>
              <th style="border: 1px solid #2d3748; padding: 12px; text-align: left; font-size: 13px;">Course Title</th>
              <th style="border: 1px solid #2d3748; padding: 12px; text-align: center; font-size: 13px;">Credits</th>
              <th style="border: 1px solid #2d3748; padding: 12px; text-align: center; font-size: 13px;">Internal</th>
              <th style="border: 1px solid #2d3748; padding: 12px; text-align: center; font-size: 13px;">External</th>
              <th style="border: 1px solid #2d3748; padding: 12px; text-align: center; font-size: 13px;">Total</th>
              <th style="border: 1px solid #2d3748; padding: 12px; text-align: center; font-size: 13px;">Grade</th>
              <th style="border: 1px solid #2d3748; padding: 12px; text-align: center; font-size: 13px;">Grade Points</th>
            </tr>
          </thead>
          <tbody>
            {{marks_table}}
          </tbody>
        </table>
      </div>

      <!-- Semester Summary -->
      <div style="margin-bottom: 25px; background: #edf2f7; padding: 20px; border-radius: 8px; border: 2px solid #cbd5e0;">
        <div style="display: flex; gap: 30px; justify-content: space-around;">
          <div style="text-align: center;">
            <p style="margin: 0 0 5px; color: #666; font-size: 13px; font-weight: bold;">Total Credits</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2d3748;">{{total_credits}}</p>
          </div>
          <div style="text-align: center;">
            <p style="margin: 0 0 5px; color: #666; font-size: 13px; font-weight: bold;">SGPA</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #3182ce;">{{sgpa}}</p>
          </div>
          <div style="text-align: center;">
            <p style="margin: 0 0 5px; color: #666; font-size: 13px; font-weight: bold;">CGPA</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #3182ce;">{{cgpa}}</p>
          </div>
          <div style="text-align: center;">
            <p style="margin: 0 0 5px; color: #666; font-size: 13px; font-weight: bold;">Percentage</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2d3748;">{{percentage}}%</p>
          </div>
        </div>
      </div>

      <!-- Grading System -->
      <div style="margin-bottom: 25px; border: 1px solid #cbd5e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #4a5568; color: white; padding: 8px 15px;">
          <h4 style="margin: 0; font-size: 14px;">GRADING SYSTEM</h4>
        </div>
        <div style="padding: 15px; background: white;">
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px;"><strong>O (90-100)</strong> - Outstanding (10)</td>
              <td style="padding: 5px;"><strong>A+ (80-89)</strong> - Excellent (9)</td>
              <td style="padding: 5px;"><strong>A (70-79)</strong> - Very Good (8)</td>
              <td style="padding: 5px;"><strong>B+ (60-69)</strong> - Good (7)</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>B (50-59)</strong> - Above Average (6)</td>
              <td style="padding: 5px;"><strong>C (40-49)</strong> - Average (5)</td>
              <td style="padding: 5px;"><strong>P (35-39)</strong> - Pass (4)</td>
              <td style="padding: 5px;"><strong>F (Below 35)</strong> - Fail (0)</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Result Declaration -->
      <div style="margin-bottom: 25px; padding: 15px; background: {{result_status === 'PASS' ? '#c6f6d5' : '#fed7d7'}}; border-left: 4px solid {{result_status === 'PASS' ? '#38a169' : '#e53e3e'}}; border-radius: 4px;">
        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #2d3748;">
          Result: <span style="color: {{result_status === 'PASS' ? '#38a169' : '#e53e3e'}};">{{result_status}}</span>
        </p>
      </div>

      <!-- Signatures -->
      <div style="margin-top: 60px; display: flex; justify-content: space-between; padding: 0 30px;">
        <div style="text-align: center;">
          <div style="border-top: 2px solid #2d3748; padding-top: 8px; margin-top: 50px; min-width: 180px;">
            <strong style="font-size: 13px;">Controller of Examinations</strong>
          </div>
        </div>
        <div style="text-align: center;">
          <div style="border-top: 2px solid #2d3748; padding-top: 8px; margin-top: 50px; min-width: 180px;">
            <strong style="font-size: 13px;">Principal/Dean</strong>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 40px; text-align: center; padding: 15px; border-top: 2px solid #cbd5e0; background: #f7fafc;">
        <p style="margin: 0; font-size: 11px; color: #666;">
          <strong>Note:</strong> This is a computer-generated transcript. For verification, contact the examination department.
        </p>
        <p style="margin: 5px 0 0; font-size: 11px; color: #666;">
          Date of Issue: {{issue_date}} | Transcript ID: {{transcript_id}}
        </p>
      </div>
    </div>
  `,

    termAssessment: `
    <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 210mm; margin: 0 auto; background: white;">
      <!-- Header -->
      <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
        <h1 style="margin: 0 0 10px; font-size: 26px; text-transform: uppercase; letter-spacing: 2px;">
          {{school_name}}
        </h1>
        <p style="margin: 0; font-size: 13px; opacity: 0.9;">{{school_address}}</p>
        <div style="margin-top: 15px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px; display: inline-block;">
          <h2 style="margin: 0; font-size: 18px; letter-spacing: 1px;">TERM ASSESSMENT REPORT</h2>
        </div>
      </div>

      <!-- Student Info Card -->
      <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 25px; border-left: 5px solid #667eea;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div>
            <p style="margin: 0 0 5px; color: #666; font-size: 12px; font-weight: bold;">STUDENT NAME</p>
            <p style="margin: 0; font-size: 16px; color: #2d3748;">{{student_name}}</p>
          </div>
          <div>
            <p style="margin: 0 0 5px; color: #666; font-size: 12px; font-weight: bold;">ROLL NUMBER</p>
            <p style="margin: 0; font-size: 16px; color: #2d3748;">{{roll_number}}</p>
          </div>
          <div>
            <p style="margin: 0 0 5px; color: #666; font-size: 12px; font-weight: bold;">CLASS & SECTION</p>
            <p style="margin: 0; font-size: 16px; color: #2d3748;">{{class}} - {{section}}</p>
          </div>
          <div>
            <p style="margin: 0 0 5px; color: #666; font-size: 12px; font-weight: bold;">TERM</p>
            <p style="margin: 0; font-size: 16px; color: #2d3748;">{{exam_name}}</p>
          </div>
        </div>
      </div>

      <!-- Marks Table -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #2d3748; margin-bottom: 12px; font-size: 16px; padding-bottom: 8px; border-bottom: 3px solid #667eea;">
          📊 Subject-wise Performance
        </h3>
        <table style="width: 100%; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
              <th style="padding: 14px; text-align: left; font-size: 13px;">Subject</th>
              <th style="padding: 14px; text-align: center; font-size: 13px;">Max Marks</th>
              <th style="padding: 14px; text-align: center; font-size: 13px;">Obtained</th>
              <th style="padding: 14px; text-align: center; font-size: 13px;">Percentage</th>
              <th style="padding: 14px; text-align: center; font-size: 13px;">Grade</th>
            </tr>
          </thead>
          <tbody>
            {{marks_table}}
          </tbody>
        </table>
      </div>

      <!-- Performance Summary -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 4px 12px rgba(102,126,234,0.3);">
          <p style="margin: 0 0 8px; font-size: 12px; opacity: 0.9;">Total Marks</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold;">{{total_marks}}</p>
        </div>
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 4px 12px rgba(245,87,108,0.3);">
          <p style="margin: 0 0 8px; font-size: 12px; opacity: 0.9;">Percentage</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold;">{{percentage}}%</p>
        </div>
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 4px 12px rgba(79,172,254,0.3);">
          <p style="margin: 0 0 8px; font-size: 12px; opacity: 0.9;">Grade</p>
          <p style="margin: 0; font-size: 28px; font-weight: bold;">{{grade}}</p>
        </div>
      </div>

      <!-- Teacher's Feedback -->
      <div style="background: #fff9e6; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h4 style="margin: 0 0 12px; color: #2d3748; font-size: 15px;">💬 Teacher's Feedback</h4>
        <div style="background: white; padding: 15px; border-radius: 6px; min-height: 60px; color: #4a5568;">
          {{teacher_remarks}}
        </div>
      </div>

      <!-- Signatures -->
      <div style="margin-top: 50px; display: flex; justify-content: space-between; padding: 0 20px;">
        <div style="text-align: center;">
          <div style="border-top: 2px solid #2d3748; padding-top: 8px; margin-top: 50px; min-width: 150px;">
            <strong>Class Teacher</strong>
          </div>
        </div>
        <div style="text-align: center;">
          <div style="border-top: 2px solid #2d3748; padding-top: 8px; margin-top: 50px; min-width: 150px;">
            <strong>Parent's Signature</strong>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; text-align: center; padding-top: 15px; border-top: 2px solid #e2e8f0; font-size: 11px; color: #666;">
        <p style="margin: 0;">Generated on: {{issue_date}} | Academic Year: {{academic_year}}</p>
      </div>
    </div>
  `
};

module.exports = templates;
