Add the following environment variables to your server .env for Cloudinary uploads:

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

The doctor verification endpoint accepts multipart/form-data at:
POST /api/doctor/verify-doctor?doctorId=<doctorId>

Fields accepted:
- fullName, gender, dateOfBirth, medicalCouncilRegistrationNumber, ... (form fields)
- qualifications (stringified JSON array)

Files accepted:
- profileImage (single)
- identityDocument (single)
- medicalCouncilCertificate (single)
- qualificationCertificates (multiple)

The server uploads files to Cloudinary and stores secure URLs in the verification document.
