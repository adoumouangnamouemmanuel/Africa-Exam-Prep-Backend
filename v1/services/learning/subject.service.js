const { Subject } = require("../../../models/learning/subject.model");
const NotFoundError = require("../../../errors/notFoundError");
const BadRequestError = require("../../../errors/badRequestError");
const ConflictError = require("../../../errors/conflictError");
const createLogger = require("../../logging.service");

const logger = createLogger("SubjectService");

// =============== CREATE SUBJECT ===============
const createSubject = async (subjectData) => {
  logger.info("===================createSubject=======================");

  // Check if subject with same code already exists
  const existingSubject = await Subject.findOne({
    code: subjectData.code.toUpperCase(),
  });
  if (existingSubject) {
    throw new ConflictError("Une matière avec ce code existe déjà");
  }

  // Check if subject with same name already exists
  const existingName = await Subject.findOne({
    name: { $regex: new RegExp(`^${subjectData.name}$`, "i") },
  });
  if (existingName) {
    throw new ConflictError("Une matière avec ce nom existe déjà");
  }

  const subject = new Subject(subjectData);
  await subject.save();

  logger.info("++++++✅ CREATE SUBJECT: Subject created successfully ++++++");
  return subject;
};

// =============== GET ALL SUBJECTS ===============
const getSubjects = async (query) => {
  logger.info("===================getSubjects=======================");

  const {
    page = 1,
    limit = 10,
    category,
    examType,
    country,
    educationLevel,
    series,
    isActive,
    isPremium,
    isFeatured,
    search,
    sortBy = "name",
    sortOrder = "asc",
  } = query;

  // Build filter object
  const filter = { status: "active" };

  if (category) filter.category = category;
  if (examType) filter.examTypes = examType;
  if (country) filter.countries = country;
  if (educationLevel) filter.educationLevels = educationLevel;
  if (series) filter.series = series;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (isPremium !== undefined) filter.isPremium = isPremium === "true";
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";

  // Add search functionality
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query with pagination
  const [subjects, total] = await Promise.all([
    Subject.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
    Subject.countDocuments(filter),
  ]);

  const pagination = {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    totalCount: total,
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };

  logger.info("++++++✅ GET SUBJECTS: Subjects retrieved successfully ++++++");
  return { subjects, pagination };
};

// =============== GET SUBJECT BY ID ===============
const getSubjectById = async (subjectId) => {
  logger.info("===================getSubjectById=======================");

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new NotFoundError("Matière non trouvée");
  }

  logger.info(
    "++++++✅ GET SUBJECT BY ID: Subject retrieved successfully ++++++"
  );
  return subject;
};

// =============== UPDATE SUBJECT ===============
const updateSubject = async (subjectId, updateData) => {
  logger.info("===================updateSubject=======================");

  // Check if subject exists
  const existingSubject = await Subject.findById(subjectId);
  if (!existingSubject) {
    throw new NotFoundError("Matière non trouvée");
  }

  // Check for duplicate code if code is being updated
  if (updateData.code && updateData.code !== existingSubject.code) {
    const duplicateCode = await Subject.findOne({
      code: updateData.code.toUpperCase(),
      _id: { $ne: subjectId },
    });
    if (duplicateCode) {
      throw new ConflictError("Une matière avec ce code existe déjà");
    }
  }

  // Check for duplicate name if name is being updated
  if (updateData.name && updateData.name !== existingSubject.name) {
    const duplicateName = await Subject.findOne({
      name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
      _id: { $ne: subjectId },
    });
    if (duplicateName) {
      throw new ConflictError("Une matière avec ce nom existe déjà");
    }
  }

  const subject = await Subject.findByIdAndUpdate(
    subjectId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  logger.info("++++++✅ UPDATE SUBJECT: Subject updated successfully ++++++");
  return subject;
};

// =============== DELETE SUBJECT ===============
const deleteSubject = async (subjectId) => {
  logger.info("===================deleteSubject=======================");

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new NotFoundError("Matière non trouvée");
  }

  // Soft delete - just mark as inactive
  await Subject.findByIdAndUpdate(subjectId, {
    isActive: false,
    status: "inactive",
  });

  logger.info("++++++✅ DELETE SUBJECT: Subject deleted successfully ++++++");
};

// =============== GET FEATURED SUBJECTS ===============
const getFeaturedSubjects = async (limit = 6) => {
  logger.info("===================getFeaturedSubjects=======================");

  const subjects = await Subject.getFeatured(limit);

  logger.info(
    "++++++✅ GET FEATURED SUBJECTS: Featured subjects retrieved ++++++"
  );
  return subjects;
};

// =============== GET POPULAR SUBJECTS ===============
const getPopularSubjects = async (limit = 10) => {
  logger.info("===================getPopularSubjects=======================");

  const subjects = await Subject.getPopular(limit);

  logger.info(
    "++++++✅ GET POPULAR SUBJECTS: Popular subjects retrieved ++++++"
  );
  return subjects;
};

// =============== GET SUBJECTS BY EDUCATION AND COUNTRY ===============
const getSubjectsByEducationAndCountry = async (educationLevel, country) => {
  logger.info(
    "===================getSubjectsByEducationAndCountry======================="
  );

  if (!educationLevel || !country) {
    throw new BadRequestError("Niveau d'éducation et pays requis");
  }

  const subjects = await Subject.findByEducationAndCountry(
    educationLevel,
    country
  );

  logger.info(
    "++++++✅ GET SUBJECTS BY EDUCATION AND COUNTRY: Subjects retrieved ++++++"
  );
  return subjects;
};

// =============== GET SUBJECTS BY EXAM TYPE ===============
const getSubjectsByExamType = async (examType, educationLevel = null) => {
  logger.info(
    "===================getSubjectsByExamType======================="
  );

  if (!examType) {
    throw new BadRequestError("Type d'examen requis");
  }

  const subjects = await Subject.findByExamType(examType, educationLevel);

  logger.info("++++++✅ GET SUBJECTS BY EXAM TYPE: Subjects retrieved ++++++");
  return subjects;
};

// =============== SEARCH SUBJECTS ===============
const searchSubjects = async (searchTerm, filters = {}) => {
  logger.info("===================searchSubjects=======================");

  if (!searchTerm || searchTerm.trim().length < 2) {
    throw new BadRequestError(
      "Le terme de recherche doit contenir au moins 2 caractères"
    );
  }

  const query = {
    $or: [
      { name: { $regex: searchTerm.trim(), $options: "i" } },
      { description: { $regex: searchTerm.trim(), $options: "i" } },
      { code: { $regex: searchTerm.trim(), $options: "i" } },
    ],
    isActive: true,
    status: "active",
  };

  // Apply additional filters
  if (filters.category) query.category = filters.category;
  if (filters.examType) query.examTypes = filters.examType;
  if (filters.country) query.countries = filters.country;
  if (filters.educationLevel) query.educationLevels = filters.educationLevel;
  if (filters.isPremium !== undefined)
    query.isPremium = filters.isPremium === "true";

  const subjects = await Subject.find(query)
    .sort({ "stats.totalStudents": -1, name: 1 })
    .limit(20);

  logger.info("++++++✅ SEARCH SUBJECTS: Search completed successfully ++++++");
  return subjects;
};

// =============== UPDATE SUBJECT STATS ===============
const updateSubjectStats = async (subjectId, field, increment = 1) => {
  logger.info("===================updateSubjectStats=======================");

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new NotFoundError("Matière non trouvée");
  }

  await subject.updateStats(field, increment);

  logger.info(
    "++++++✅ UPDATE SUBJECT STATS: Stats updated successfully ++++++"
  );
  return subject;
};

// =============== ADD STUDENT TO SUBJECT ===============
const addStudentToSubject = async (subjectId) => {
  logger.info("===================addStudentToSubject=======================");

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new NotFoundError("Matière non trouvée");
  }

  await subject.addStudent();

  logger.info(
    "++++++✅ ADD STUDENT TO SUBJECT: Student added successfully ++++++"
  );
  return subject;
};

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getFeaturedSubjects,
  getPopularSubjects,
  getSubjectsByEducationAndCountry,
  getSubjectsByExamType,
  searchSubjects,
  updateSubjectStats,
  addStudentToSubject,
};
