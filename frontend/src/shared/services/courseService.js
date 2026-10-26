import apiClient from './apiClient'
import { extractApiData, logApiError, logApiRequest, logApiSuccess, withPagedResponse } from './apiModuleHelpers'
import { API_ENDPOINTS } from '@/api/endpoints'

// Course CRUD is exposed as a platform-level API. Organization scoping is
// derived by the backend from the authenticated access token.
const COURSE_ENDPOINT = API_ENDPOINTS.courses.base

const deletedCoursesKey = () => {
  const organizationId = localStorage.getItem('organization_id')
    || localStorage.getItem('organizationId')
    || localStorage.getItem('orgId')
    || 'current'
  return `deletedCourseIds:${organizationId}`
}

const deletedCourseIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(deletedCoursesKey()) || '[]').map(String))
  } catch {
    return new Set()
  }
}

const rememberDeletedCourse = (id) => {
  const ids = deletedCourseIds()
  ids.add(String(id))
  localStorage.setItem(deletedCoursesKey(), JSON.stringify([...ids]))
}

const withoutDeletedCourses = (page) => {
  const deleted = deletedCourseIds()
  const data = page.data.filter((course) => !deleted.has(String(course.courseId ?? course.id)))
  return { ...page, data, totalRecords: Math.max(0, page.totalRecords - (page.data.length - data.length)) }
}

const buildParams = (params = {}) => ({
  organizationId: params.organizationId ?? params.orgId ?? undefined,
  search: params.search ?? params.searchText ?? undefined,
  status: params.status ?? undefined,
  mentorId: params.mentorId ?? undefined,
  batchId: params.batchId ?? undefined,
  level: params.level ?? undefined,
  sortBy: params.sortBy ?? 'CourseName',
  sortOrder: params.sortOrder ?? 'asc',
  page: params.page ?? params.pageNumber ?? 1,
  pageSize: params.pageSize ?? 10,
})

const toStatusBoolean = (status) =>
  typeof status === 'boolean'
    ? status
    : ['active', 'published', 'true', '1'].includes(String(status).trim().toLowerCase())

const toPayload = (payload = {}, includeStatus = false) => ({
  courseName: String(payload.courseName ?? payload.title ?? payload.name ?? '').trim(),
  duration: String(payload.duration ?? '').trim(),
  level: payload.level ?? payload.category ?? undefined,
  price: Number(payload.courseFee ?? payload.fee ?? payload.price ?? 0),
  ...(includeStatus && payload.status !== undefined ? { status: toStatusBoolean(payload.status) } : {}),
})

const sendRequest = async (method, endpoint, executor, payload) => {
  logApiRequest(method, endpoint, payload)
  try {
    const response = await executor()
    logApiSuccess(response)
    return extractApiData(response)
  } catch (error) {
    logApiError(error)
    throw error
  }
}

export const courseService = {
  // Public landing-page list: matches the backend contract exactly without
  // optional management-table pagination parameters.
  getPublicCourses: async () => {
    const response = await sendRequest('GET', COURSE_ENDPOINT, () => apiClient.get(COURSE_ENDPOINT), {})
    return withPagedResponse(response)
  },
  getCourses: async (params = {}) => {
    const response = await sendRequest('GET', COURSE_ENDPOINT, () => apiClient.get(COURSE_ENDPOINT, { params: buildParams(params) }), buildParams(params))
    return withoutDeletedCourses(withPagedResponse(response))
  },
  getCourse: async (id) => sendRequest('GET', API_ENDPOINTS.courses.byId(id), () => apiClient.get(API_ENDPOINTS.courses.byId(id)), { id }),
  getPdf: async (id, config = {}) => apiClient.get(API_ENDPOINTS.courses.pdf(id), {
    ...config,
    headers: { Accept: 'application/pdf', ...(config.headers || {}) },
    responseType: 'blob',
  }).then((response) => response.data),
  getSyllabus: async (id) => {
    const response = await sendRequest('GET', API_ENDPOINTS.organization.courseSyllabus(id), () => apiClient.get(API_ENDPOINTS.organization.courseSyllabus(id)), { id })
    return response?.data ?? response
  },
  createSyllabus: async (id, payload) => {
    const response = await sendRequest('POST', API_ENDPOINTS.organization.courseSyllabus(id), () => apiClient.post(API_ENDPOINTS.organization.courseSyllabus(id), payload), { id, ...payload })
    return response?.data ?? response
  },
  // multipart/form-data with the PDF in the "file" field. apiClient drops its
  // JSON Content-Type for FormData so the browser adds the multipart boundary.
  // Only parses the PDF — nothing is saved until createSyllabus().
  importSyllabusPdf: async (id, file) => {
    const endpoint = API_ENDPOINTS.organization.courseSyllabusImportPdf(id)
    const formData = new FormData()
    formData.append('file', file)
    const response = await sendRequest('POST', endpoint, () => apiClient.post(endpoint, formData, { timeout: 120000 }), { id, fileName: file?.name })
    return response?.data ?? response
  },
  createCourse: async (payload) => sendRequest('POST', COURSE_ENDPOINT, () => apiClient.post(COURSE_ENDPOINT, toPayload(payload, true)), payload),
  updateCourse: async (id, payload) => sendRequest('PUT', API_ENDPOINTS.courses.byId(id), () => apiClient.put(API_ENDPOINTS.courses.byId(id), toPayload(payload, true)), { id, ...payload }),
  deleteCourse: async (id) => {
    const response = await sendRequest('DELETE', API_ENDPOINTS.courses.byId(id), () => apiClient.delete(API_ENDPOINTS.courses.byId(id)), { id })
    rememberDeletedCourse(id)
    return response
  },
  uploadPdf: async (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    if (import.meta.env.DEV) {
      console.group('📎 COURSE PDF UPLOAD')
      console.log('file.name:', file?.name)
      console.log('file.type:', file?.type)
      console.log('file.size:', file?.size)
      console.log('baseURL:', apiClient.defaults.baseURL)
      console.log('url:', `${COURSE_ENDPOINT}/${id}/upload-pdf`)
      console.log('timeout:', 120000)
      console.log('formData:', formData)
      console.groupEnd()
    }
    return sendRequest('POST', API_ENDPOINTS.courses.uploadPdf(id), () => apiClient.post(API_ENDPOINTS.courses.uploadPdf(id), formData, {
      headers: { Accept: 'application/json' },
      timeout: 120000,
    }), { id, fileName: file?.name })
  },
}

export default courseService
