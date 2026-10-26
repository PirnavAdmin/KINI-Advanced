import { useEffect, useState } from 'react'
import { studentsApi } from '@/api/students'
import { courseService } from '@/services/courseService'
import { resolveUserId } from '@/services/profileService'
import { useAuth } from '@shared/hooks/useAuth'

const titleCase = (value) => String(value || '').trim().replace(/\b\w/g, (character) => character.toUpperCase())

// A student's assigned mentor has no dedicated endpoint of its own — it's
// embedded in the student's enrollment record and/or their enrolled course,
// the same real source Student -> My Batch already reads (StudentMyBatch.jsx
// getMentorDetails). Kept identical here so both pages describe the same
// mentor the same way.
const getMentor = (source = {}) => {
  const nestedMentor = source.mentor ?? source.assignedMentor ?? source.tutor
  const mentor = nestedMentor && typeof nestedMentor === 'object' ? nestedMentor : {}
  const name = source.mentorName ?? source.assignedMentorName ?? source.tutorName
    ?? mentor.name ?? mentor.fullName ?? mentor.mentorName
    ?? [mentor.firstName, mentor.lastName].filter(Boolean).join(' ')
  const id = source.mentorId ?? source.assignedMentorId ?? source.tutorId ?? mentor.mentorId ?? mentor.employeeId ?? mentor.id
  if (!name && id == null) return null
  return {
    mentorId: id ?? null,
    name: titleCase(name) || 'Assigned mentor',
    email: source.mentorEmail ?? mentor.email ?? '',
    phone: source.mentorPhone ?? mentor.phone ?? mentor.mobile ?? '',
    designation: titleCase(source.mentorDesignation ?? mentor.designation ?? mentor.role ?? 'Mentor'),
    course: source.courseName ?? source.course?.name ?? source.course?.courseName ?? '',
    batch: source.batchName ?? source.batch?.name ?? source.batch?.batchName ?? '',
  }
}

// The real "who is my assigned mentor" source for the authenticated student.
export function useAssignedMentor() {
  const { user, authLoading } = useAuth()
  const [mentor, setMentor] = useState(() => getMentor(user?.student ?? user))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const resolve = async () => {
      const enrollment = user?.student ?? user ?? {}
      const immediate = getMentor(enrollment)
      if (immediate && active) setMentor(immediate)
      if (authLoading) return
      const studentId = user?.studentId ?? user?.StudentId ?? user?.student?.studentId
        ?? user?.student?.id ?? localStorage.getItem('studentId') ?? resolveUserId(user)
      if (!studentId) {
        if (active) setLoading(false)
        return
      }
      try {
        const response = await studentsApi.getById(studentId, { skipAuthRedirect: true })
        if (!active) return
        const student = response?.data ?? {}
        let enriched = student
        if (!getMentor(student)) {
          try {
            const courses = await courseService.getStudentCourses()
            enriched = { ...student, ...(courses?.[0] ?? {}) }
          } catch {
            // Keep the student record when course data is unavailable.
          }
        }
        if (active) {
          setMentor(getMentor(enriched) ?? immediate)
          setLoading(false)
        }
      } catch (requestError) {
        if (!active) return
        if (!immediate) setError(requestError?.response?.data?.message ?? 'Unable to load your assigned mentor.')
        setLoading(false)
      }
    }
    resolve()
    return () => { active = false }
  }, [authLoading, user])

  return { mentor, loading, error }
}

export default useAssignedMentor
