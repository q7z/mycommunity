import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Coffee,
  ExternalLink,
  HeartHandshake,
  Home,
  Lightbulb,
  MapPin,
  MessageCircle,
  Route,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { type FormEvent, type PointerEvent, type WheelEvent, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { buildPlan, residentProfiles, starterTouchpoints } from './data/community'
import type { ResidentProfile } from './data/community'
import { unitNumbersById } from './data/unitNumbers'

type MapUnit = {
  id: string
  unitNumber: string | null
  displayUnitNumber: string | null
  path: string
  centroid: { x: number; y: number }
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
  isAvailable: boolean
}

type Floor = {
  id: string
  label: string
  shortLabel: string
  building: string
  units: MapUnit[]
}

type AvailableUnit = {
  id: string
  floorId: string
  floorPlanId: string
  unitNumber: string
  displayUnitNumber: string
  displayArea: string
  area: number
  displayPrice: string
  price: number
  displayAvailableOn: string
  availableOn: string
  links: { label: string | null; url: string; iconType: string | null }[]
}

type FloorPlan = {
  id: string
  name: string
  bedrooms: number
  bathrooms: number
  bedroomLabel: string
  bathroomLabel: string
  imageUrl: string
  secondaryImageUrl: string | null
}

type LandingMapData = {
  width: number
  height: number
  floors: Floor[]
  floorPlans: FloorPlan[]
  units: AvailableUnit[]
  source: {
    page: string
    sightmap: string
    umap: string
    retrievedAt: string
  }
}

type FilterMode = 'all' | 'friends' | 'available'

type Touchpoint = {
  id: string
  unitId: string
  label: string
  detail: string
}

type ResidentForm = {
  names: string
  work: string
  interests: string
  preferredContact: string
  note: string
}

const filterLabels: Record<FilterMode, string> = {
  all: 'All',
  friends: 'People',
  available: 'Open',
}

const stageLabels: Record<string, string> = {
  new: 'New',
  friendly: 'Friendly',
  close: 'Close',
  host: 'Host',
}

const emptyResidentForm: ResidentForm = {
  names: '',
  work: '',
  interests: '',
  preferredContact: '',
  note: '',
}

const MIN_ZOOM = 0.55
const MAX_ZOOM = 3.2

function clampZoom(value: number) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value))
}

function getInitials(name: string) {
  return name
    .split(/\\s+|&/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function unitNumberFor(unit?: MapUnit | null, fallback?: AvailableUnit | null, resident?: ResidentProfile | null) {
  return unit?.unitNumber
    ?? fallback?.unitNumber
    ?? resident?.unitLabel
    ?? (unit ? unitNumbersById[unit.id] : undefined)
}

function unitLabel(unit?: MapUnit | null, fallback?: AvailableUnit | null, resident?: ResidentProfile | null) {
  const unitNumber = unitNumberFor(unit, fallback, resident)

  return unitNumber ? `APT ${unitNumber}` : unit ? `Unit ${unit.id}` : 'Apartment'
}

function getRelationshipTone(score: number) {
  if (score >= 82) return 'excellent'
  if (score >= 64) return 'warm'
  if (score >= 44) return 'growing'
  return 'new'
}

function getUnitLabelMetrics(unit: MapUnit, label: string) {
  const width = Math.max(1, unit.bounds.maxX - unit.bounds.minX)
  const height = Math.max(1, unit.bounds.maxY - unit.bounds.minY)
  const fontSize = Math.max(9, Math.min(16, width / (label.length * 0.72), height * 0.34))

  return {
    fontSize: Math.round(fontSize * 10) / 10,
    x: (unit.bounds.minX + unit.bounds.maxX) / 2,
    y: (unit.bounds.minY + unit.bounds.maxY) / 2,
  }
}

function readStoredJson<T>(key: string, fallback: T) {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function getPercent(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0
}

function isContactTouchpoint(touchpoint: Touchpoint) {
  return touchpoint.label === 'Coffee logged' || touchpoint.label === 'Help logged'
}

function App() {
  const [mapData, setMapData] = useState<LandingMapData | null>(null)
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null)
  const [selectedUnitId, setSelectedUnitId] = useState<string>('651467')
  const [query, setQuery] = useState('')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [zoom, setZoom] = useState(1)
  const [relationshipBoosts, setRelationshipBoosts] = useState<Record<string, number>>(() =>
    readStoredJson('landing.relationshipBoosts', {}),
  )
  const [homeUnitId, setHomeUnitId] = useState<string | null>(() => localStorage.getItem('landing.homeUnitId'))
  const [touchpoints, setTouchpoints] = useState<Touchpoint[]>(() =>
    readStoredJson('landing.touchpoints', starterTouchpoints),
  )
  const [customResidents, setCustomResidents] = useState<ResidentProfile[]>(() =>
    readStoredJson('landing.customResidents', []),
  )
  const [draftOpen, setDraftOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [residentFormOpen, setResidentFormOpen] = useState(false)
  const [residentForm, setResidentForm] = useState<ResidentForm>(emptyResidentForm)
  const [isPanning, setIsPanning] = useState(false)
  const mapCanvasRef = useRef<HTMLDivElement | null>(null)
  const floorMapRef = useRef<SVGSVGElement | null>(null)
  const panRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    scrollLeft: number
    scrollTop: number
    targetUnitId?: string
    hasMoved: boolean
  } | null>(null)
  const suppressApartmentClickRef = useRef(false)
  const zoomRef = useRef(zoom)

  useEffect(() => {
    let ignore = false

    fetch(`${import.meta.env.BASE_URL}data/landing-map.json`)
      .then((response) => response.json())
      .then((data: LandingMapData) => {
        if (ignore) return
        setMapData(data)
        setActiveFloorId(data.floors[0]?.id ?? null)
      })
      .catch((error) => {
        console.error('Unable to load map data', error)
      })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  const allResidents = useMemo(() => {
    const byUnit = new Map(residentProfiles.map((profile) => [profile.unitId, profile]))
    customResidents.forEach((profile) => byUnit.set(profile.unitId, profile))
    return Array.from(byUnit.values())
  }, [customResidents])
  const residentsByUnit = useMemo(() => new Map(allResidents.map((profile) => [profile.unitId, profile])), [allResidents])
  const knownUnitIds = useMemo(() => {
    const known = new Set<string>()
    Object.entries(relationshipBoosts).forEach(([unitId, boost]) => {
      if (boost > 0) known.add(unitId)
    })
    touchpoints.forEach((touchpoint) => {
      if (isContactTouchpoint(touchpoint)) known.add(touchpoint.unitId)
    })
    return known
  }, [relationshipBoosts, touchpoints])
  const availableByUnit = useMemo(() => new Map(mapData?.units.map((unit) => [unit.id, unit]) ?? []), [mapData])
  const floorPlanById = useMemo(
    () => new Map(mapData?.floorPlans.map((plan) => [plan.id, plan]) ?? []),
    [mapData],
  )

  const activeFloor = mapData?.floors.find((floor) => floor.id === activeFloorId) ?? mapData?.floors[0] ?? null
  const selectedUnit = activeFloor?.units.find((unit) => unit.id === selectedUnitId)
    ?? mapData?.floors.flatMap((floor) => floor.units).find((unit) => unit.id === selectedUnitId)
    ?? null
  const selectedResident = selectedUnit ? residentsByUnit.get(selectedUnit.id) : undefined
  const selectedAvailability = selectedUnit ? availableByUnit.get(selectedUnit.id) : undefined
  const selectedFloorPlan = selectedAvailability ? floorPlanById.get(selectedAvailability.floorPlanId) : undefined
  const selectedScore = selectedResident
    ? Math.min(100, selectedResident.relationship + (relationshipBoosts[selectedResident.unitId] ?? 0))
    : 0
  const homeUnit = homeUnitId
    ? mapData?.floors.flatMap((floor) => floor.units).find((unit) => unit.id === homeUnitId)
    : null
  const homeResident = homeUnit ? residentsByUnit.get(homeUnit.id) : undefined
  const homeFloor = homeUnitId
    ? mapData?.floors.find((floor) => floor.units.some((unit) => unit.id === homeUnitId))
    : null

  const searchText = query.trim().toLowerCase()

  const matchingUnitIds = useMemo(() => {
    if (!mapData) return new Set<string>()
    if (!searchText && filterMode === 'all') return new Set(mapData.floors.flatMap((floor) => floor.units.map((unit) => unit.id)))

    return new Set(
      mapData.floors.flatMap((floor) =>
        floor.units
          .filter((unit) => {
            const resident = residentsByUnit.get(unit.id)
            const availability = availableByUnit.get(unit.id)
            const matchesFilter =
              filterMode === 'all'
              || (filterMode === 'friends' && Boolean(resident))
              || (filterMode === 'available' && Boolean(availability))
            const haystack = [
              unit.id,
              unit.unitNumber,
              unit.displayUnitNumber,
              unitNumbersById[unit.id],
              floor.label,
              resident?.names,
              resident?.work,
              resident?.stage,
              resident?.sourceLabel,
              ...(resident?.interests ?? []),
              availability?.displayUnitNumber,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()

            return matchesFilter && (!searchText || haystack.includes(searchText))
          })
          .map((unit) => unit.id),
      ),
    )
  }, [availableByUnit, filterMode, mapData, residentsByUnit, searchText])

  const visibleResidents = useMemo(() => {
    return allResidents
      .map((profile) => ({
        ...profile,
        adjustedRelationship: Math.min(100, profile.relationship + (relationshipBoosts[profile.unitId] ?? 0)),
      }))
      .sort((a, b) => b.adjustedRelationship - a.adjustedRelationship)
  }, [allResidents, relationshipBoosts])

  const introSuggestions = useMemo(() => {
    if (!selectedResident) return []

    return allResidents
      .filter((profile) => profile.unitId !== selectedResident.unitId)
      .map((profile) => {
        const sharedInterests = profile.interests.filter((interest) => selectedResident.interests.includes(interest))
        const score = sharedInterests.length * 8
          + (profile.stage === 'host' ? 5 : 0)
          + Math.max(0, 5 - Math.abs(profile.relationship - selectedResident.relationship) / 12)
        const reason = sharedInterests.length
          ? `Shared interest: ${sharedInterests.join(', ')}`
          : profile.stage === 'host'
            ? `${profile.names.split(' ')[0]} is a reliable host for gentle introductions`
            : `${profile.socialStyle} pairs well with ${selectedResident.socialStyle.toLowerCase()}`

        return { ...profile, reason, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [allResidents, selectedResident])

  const nearbyResidents = useMemo(() => {
    if (!mapData || !homeUnitId) return []
    const floorIndexById = new Map(mapData.floors.map((floor, index) => [floor.id, index]))
    const homeFloorId = mapData.floors.find((floor) => floor.units.some((unit) => unit.id === homeUnitId))?.id

    return allResidents
      .filter((profile) => profile.unitId !== homeUnitId)
      .map((profile) => {
        const floor = mapData.floors.find((candidate) => candidate.units.some((unit) => unit.id === profile.unitId))
        const distance = homeFloorId && floor
          ? Math.abs((floorIndexById.get(floor.id) ?? 0) - (floorIndexById.get(homeFloorId) ?? 0))
          : 99
        return { ...profile, floorLabel: floor?.shortLabel ?? '?', distance }
      })
      .sort((a, b) => a.distance - b.distance || b.relationship - a.relationship)
      .slice(0, 4)
  }, [allResidents, homeUnitId, mapData])

  const introDraft = useMemo(() => {
    if (!selectedResident || !introSuggestions.length) return null
    const target = introSuggestions[0]
    const shared = selectedResident.interests.find((interest) => target.interests.includes(interest))
    const bridge = shared
      ? `you both mentioned ${shared}`
      : target.reason

    return {
      target,
      subject: `${selectedResident.names} and ${target.names}`,
      body: `Hey ${selectedResident.names.split(' ')[0]} and ${target.names.split(' ')[0]}, I thought of introducing you because ${bridge}. No pressure at all, but I think you might enjoy a quick coffee or lobby chat this week.`,
    }
  }, [introSuggestions, selectedResident])

  const activeFloorUnitCount = activeFloor?.units.length ?? 0
  const activeFloorDataUnits = activeFloor?.units.filter((unit) => residentsByUnit.has(unit.id)).length ?? 0
  const activeFloorKnownUnits = activeFloor?.units.filter((unit) => (
    residentsByUnit.has(unit.id) && knownUnitIds.has(unit.id)
  )).length ?? 0
  const activeFloorDataPercent = getPercent(activeFloorDataUnits, activeFloorUnitCount)
  const activeFloorKnownPercent = getPercent(activeFloorKnownUnits, activeFloorDataUnits)
  const activeFloorBounds = activeFloor?.units.length
    ? (() => {
        const bounds = activeFloor.units.reduce(
          (acc, unit) => ({
            minX: Math.min(acc.minX, unit.bounds.minX),
            maxX: Math.max(acc.maxX, unit.bounds.maxX),
            minY: Math.min(acc.minY, unit.bounds.minY),
            maxY: Math.max(acc.maxY, unit.bounds.maxY),
          }),
          { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
        )
        const padding = 58

        return {
          x: bounds.minX - padding,
          y: bounds.minY - padding,
          width: bounds.maxX - bounds.minX + padding * 2,
          height: bounds.maxY - bounds.minY + padding * 2,
        }
      })()
    : null
  const activeFloorBoundsX = activeFloorBounds?.x ?? 0
  const activeFloorBoundsY = activeFloorBounds?.y ?? 0
  const activeFloorBoundsWidth = activeFloorBounds?.width ?? 1
  const activeFloorBoundsHeight = activeFloorBounds?.height ?? 1
  const selectedUnitCentroidX = selectedUnit?.centroid.x ?? 0
  const selectedUnitCentroidY = selectedUnit?.centroid.y ?? 0
  const hasAutoCenterTarget = Boolean(selectedUnit && activeFloorBounds)

  useEffect(() => {
    if (!hasAutoCenterTarget || !mapCanvasRef.current || !floorMapRef.current) return

    const canvas = mapCanvasRef.current
    const floorMap = floorMapRef.current
    const canvasRect = canvas.getBoundingClientRect()
    const mapRect = floorMap.getBoundingClientRect()
    const mapLeft = mapRect.left - canvasRect.left + canvas.scrollLeft
    const mapTop = mapRect.top - canvasRect.top + canvas.scrollTop
    const xRatio = (selectedUnitCentroidX - activeFloorBoundsX) / activeFloorBoundsWidth
    const yRatio = (selectedUnitCentroidY - activeFloorBoundsY) / activeFloorBoundsHeight
    const nextLeft = mapLeft + xRatio * mapRect.width - canvas.clientWidth / 2
    const nextTop = mapTop + yRatio * mapRect.height - canvas.clientHeight / 2

    canvas.scrollTo({
      left: Math.max(0, nextLeft),
      top: Math.max(0, nextTop),
      behavior: 'smooth',
    })
  }, [
    activeFloorBoundsHeight,
    activeFloorBoundsWidth,
    activeFloorBoundsX,
    activeFloorBoundsY,
    hasAutoCenterTarget,
    selectedUnitCentroidX,
    selectedUnitCentroidY,
    selectedUnitId,
    zoom,
  ])

  useEffect(() => {
    localStorage.setItem('landing.relationshipBoosts', JSON.stringify(relationshipBoosts))
  }, [relationshipBoosts])

  useEffect(() => {
    if (homeUnitId) {
      localStorage.setItem('landing.homeUnitId', homeUnitId)
    } else {
      localStorage.removeItem('landing.homeUnitId')
    }
  }, [homeUnitId])

  useEffect(() => {
    localStorage.setItem('landing.touchpoints', JSON.stringify(touchpoints))
  }, [touchpoints])

  useEffect(() => {
    localStorage.setItem('landing.customResidents', JSON.stringify(customResidents))
  }, [customResidents])

  function selectFloor(floorId: string) {
    const floor = mapData?.floors.find((candidate) => candidate.id === floorId)
    const firstResident = floor?.units.find((unit) => residentsByUnit.has(unit.id))
    const firstAvailable = floor?.units.find((unit) => availableByUnit.has(unit.id))
    setActiveFloorId(floorId)
    setSelectedUnitId(firstResident?.id ?? firstAvailable?.id ?? floor?.units[0]?.id ?? selectedUnitId)
    setDrawerOpen(false)
    setResidentFormOpen(false)
  }

  function logTouch(unitId: string, amount: number) {
    setRelationshipBoosts((current) => ({ ...current, [unitId]: Math.min(24, (current[unitId] ?? 0) + amount) }))
    const resident = residentsByUnit.get(unitId)
    const label = amount >= 7 ? 'Help logged' : 'Coffee logged'
    setTouchpoints((current) => [
      {
        id: `${Date.now()}-${unitId}`,
        unitId,
        label,
        detail: resident ? `${resident.names} relationship memory updated.` : 'Apartment note updated.',
      },
      ...current,
    ].slice(0, 6))
  }

  function selectResidentUnit(unitId: string) {
    const floor = mapData?.floors.find((candidate) => candidate.units.some((unit) => unit.id === unitId))
    if (floor) setActiveFloorId(floor.id)
    setSelectedUnitId(unitId)
    setDrawerOpen(true)
    setResidentFormOpen(false)
  }

  function openApartment(unitId: string) {
    setSelectedUnitId(unitId)
    setDrawerOpen(true)
    setResidentFormOpen(false)
  }

  function handleMapWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault()

    const canvas = event.currentTarget
    const currentZoom = zoomRef.current
    const nextZoom = clampZoom(currentZoom * Math.exp(-event.deltaY * 0.0015))
    if (nextZoom === currentZoom) return

    const rect = canvas.getBoundingClientRect()
    const pointerX = event.clientX - rect.left
    const pointerY = event.clientY - rect.top
    const contentX = canvas.scrollLeft + pointerX
    const contentY = canvas.scrollTop + pointerY
    const zoomRatio = nextZoom / currentZoom

    zoomRef.current = nextZoom
    setZoom(nextZoom)

    window.requestAnimationFrame(() => {
      canvas.scrollLeft = contentX * zoomRatio - pointerX
      canvas.scrollTop = contentY * zoomRatio - pointerY
    })
  }

  function handleMapPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    if (event.target instanceof Element && event.target.closest('button, input, textarea, a')) return
    const targetUnitId = event.target instanceof Element
      ? event.target.closest<SVGPathElement>('[data-unit-id]')?.dataset.unitId
      : undefined

    panRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
      targetUnitId,
      hasMoved: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsPanning(true)
  }

  function handleMapPointerMove(event: PointerEvent<HTMLDivElement>) {
    const pan = panRef.current
    if (!pan || pan.pointerId !== event.pointerId) return

    const deltaX = event.clientX - pan.startX
    const deltaY = event.clientY - pan.startY
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      pan.hasMoved = true
      suppressApartmentClickRef.current = true
    }

    event.currentTarget.scrollLeft = pan.scrollLeft - deltaX
    event.currentTarget.scrollTop = pan.scrollTop - deltaY
    event.preventDefault()
  }

  function finishMapPan(event: PointerEvent<HTMLDivElement>) {
    const pan = panRef.current
    if (!pan || pan.pointerId !== event.pointerId) return
    const targetUnitId = pan.targetUnitId
    const shouldOpenApartment = event.type === 'pointerup' && Boolean(targetUnitId) && !pan.hasMoved

    panRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setIsPanning(false)

    if (shouldOpenApartment && targetUnitId) {
      openApartment(targetUnitId)
    }

    window.setTimeout(() => {
      suppressApartmentClickRef.current = false
    }, 0)
  }

  function updateResidentForm(field: keyof ResidentForm, value: string) {
    setResidentForm((current) => ({ ...current, [field]: value }))
  }

  function startAddResident() {
    setResidentForm(emptyResidentForm)
    setResidentFormOpen(true)
  }

  function saveResident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedUnit) return

    const names = residentForm.names.trim()
    if (!names) return

    const unitNumber = unitNumberFor(selectedUnit, selectedAvailability) ?? selectedUnit.id
    const interests = residentForm.interests
      .split(',')
      .map((interest) => interest.trim())
      .filter(Boolean)
      .slice(0, 5)

    const profile: ResidentProfile = {
      unitId: selectedUnit.id,
      unitLabel: unitNumber,
      names,
      work: residentForm.work.trim() || 'Work not added yet',
      stage: 'new',
      relationship: 18,
      lastTouch: 'Added today',
      note: residentForm.note.trim() || 'New resident profile. Add details as you learn them.',
      nextMove: 'Say hello and learn one easy conversation bridge.',
      preferredContact: residentForm.preferredContact.trim() || 'Ask preferred channel',
      socialStyle: 'Learning their style',
      interests: interests.length ? interests : ['new neighbor'],
      sourceLabel: 'Manual entry',
      dataFilled: true,
    }

    setCustomResidents((current) => [
      ...current.filter((resident) => resident.unitId !== selectedUnit.id),
      profile,
    ])
    setTouchpoints((current) => [
      {
        id: `${Date.now()}-${selectedUnit.id}`,
        unitId: selectedUnit.id,
        label: 'Resident added',
        detail: `${names} added to ${unitLabel(selectedUnit, selectedAvailability)}.`,
      },
      ...current,
    ].slice(0, 6))
    setResidentFormOpen(false)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">
            <Building2 size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">Community OS</p>
            <h1>The Landing</h1>
          </div>
        </div>

        <div className="home-base">
          <div className="home-icon">
            <Home size={18} aria-hidden="true" />
          </div>
          <div>
            <span>Your home base</span>
            <strong>{homeUnit ? unitLabel(homeUnit, null, homeResident) : 'Not set yet'}</strong>
            {homeFloor && <small>Floor {homeFloor.shortLabel}</small>}
          </div>
        </div>

      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">1395 22nd Street · San Francisco</p>
            <h2>Relationship Map</h2>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" title="Notifications" aria-label="Notifications">
              <Bell size={18} aria-hidden="true" />
            </button>
            <button className="primary-action" disabled={!introDraft} type="button" onClick={() => setDraftOpen(true)}>
              <MessageCircle size={17} aria-hidden="true" />
              Draft intro
            </button>
          </div>
        </header>

        {draftOpen && introDraft && (
          <section className="draft-panel" aria-label="Introduction draft">
            <div className="draft-heading">
              <div>
                <p className="eyebrow">Intro Draft</p>
                <h3>{introDraft.subject}</h3>
              </div>
              <button className="icon-button" type="button" title="Close draft" aria-label="Close draft" onClick={() => setDraftOpen(false)}>
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <p>{introDraft.body}</p>
            <div className="draft-meta">
              <span>Best channel: {selectedResident?.preferredContact}</span>
              <span>Suggested bridge: {introDraft.target.reason}</span>
            </div>
          </section>
        )}

        <section className="map-toolbar" aria-label="Map filters">
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search people, apartments, interests"
            />
          </label>
          <div className="segmented" role="group" aria-label="View">
            {(Object.keys(filterLabels) as FilterMode[]).map((mode) => (
              <button
                className={mode === filterMode ? 'active' : ''}
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode)}
              >
                {filterLabels[mode]}
              </button>
            ))}
          </div>
        </section>

        <section className="floor-screen">
          <section className="map-panel" aria-label="Interactive floor map">
            <div className="map-heading">
              <div className="floor-summary">
                <h3>{activeFloor?.label ?? 'Loading floor'}</h3>
                <span>{activeFloorUnitCount} apartments</span>
              </div>
              <div className="coverage-strip" aria-label="Floor data coverage">
                <span className="coverage-stat">
                  <span>Data</span>
                  <strong>{activeFloorDataUnits}/{activeFloorUnitCount}</strong>
                  <em>{activeFloorDataPercent}%</em>
                </span>
                <span className="coverage-stat known-stat">
                  <span>Known</span>
                  <strong>{activeFloorKnownUnits}/{activeFloorDataUnits}</strong>
                  <em>{activeFloorKnownPercent}%</em>
                </span>
              </div>
            </div>

            <div className="map-shell">
              <nav className="floor-number-overlay" aria-label="Floors">
                {mapData?.floors.map((floor) => (
                  <button
                    aria-label={`Floor ${floor.shortLabel}`}
                    className={floor.id === activeFloor?.id ? 'active' : ''}
                    key={floor.id}
                    type="button"
                    onClick={() => selectFloor(floor.id)}
                  >
                    {floor.shortLabel}
                  </button>
                ))}
              </nav>
              <div
                className={isPanning ? 'map-canvas is-panning' : 'map-canvas'}
                ref={mapCanvasRef}
                onPointerCancel={finishMapPan}
                onPointerDown={handleMapPointerDown}
                onPointerMove={handleMapPointerMove}
                onPointerUp={finishMapPan}
                onWheel={handleMapWheel}
              >
                {mapData && activeFloor ? (
                  <div className="floor-map-stage">
                    <svg
                      className="floor-map"
                      ref={floorMapRef}
                      style={{ width: `${Math.round(1480 * zoom)}px` }}
                      viewBox={
                        activeFloorBounds
                          ? `${activeFloorBounds.x} ${activeFloorBounds.y} ${activeFloorBounds.width} ${activeFloorBounds.height}`
                          : `0 0 ${mapData.width} ${mapData.height}`
                      }
                      role="img"
                      aria-label={`${activeFloor.label} apartment map`}
                    >
                      <rect
                        className="map-background"
                        height={activeFloorBounds?.height ?? mapData.height}
                        rx="28"
                        width={activeFloorBounds?.width ?? mapData.width}
                        x={activeFloorBounds?.x ?? 0}
                        y={activeFloorBounds?.y ?? 0}
                      />
                      <g>
                        {activeFloor.units.map((unit) => {
                          const resident = residentsByUnit.get(unit.id)
                          const availability = availableByUnit.get(unit.id)
                          const isSelected = unit.id === selectedUnitId
                          const isMatch = matchingUnitIds.has(unit.id)
                          const isKnownResident = Boolean(resident && knownUnitIds.has(unit.id))
                          const tone = resident && isKnownResident
                            ? getRelationshipTone(resident.relationship + (relationshipBoosts[resident.unitId] ?? 0))
                            : ''
                          const displayNumber = unitNumberFor(unit, availability, resident)
                          const labelMetrics = displayNumber ? getUnitLabelMetrics(unit, displayNumber) : null
                          const labelClassName = [
                            'unit-label',
                            resident ? (isKnownResident ? 'known-label' : 'data-label') : 'empty-label',
                            isMatch ? '' : 'is-muted-label',
                          ]
                            .filter(Boolean)
                            .join(' ')
                          const className = [
                            'unit-shape',
                            resident ? 'has-resident' : '',
                            isKnownResident ? 'is-known' : '',
                            availability ? 'is-available' : '',
                            homeUnitId === unit.id ? 'is-home' : '',
                            isSelected ? 'is-selected' : '',
                            isMatch ? '' : 'is-muted',
                            tone ? `tone-${tone}` : '',
                          ]
                            .filter(Boolean)
                            .join(' ')

                          return (
                            <g key={unit.id}>
                              <path
                                className={className}
                                data-unit-id={unit.id}
                                d={unit.path}
                                tabIndex={0}
                                role="button"
                                aria-label={unitLabel(unit, availability, resident)}
                                onClick={(event) => {
                                  if (suppressApartmentClickRef.current) {
                                    event.preventDefault()
                                    return
                                  }
                                  openApartment(unit.id)
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter' || event.key === ' ') openApartment(unit.id)
                                }}
                              />
                              {displayNumber && labelMetrics && (
                                <text
                                  className={labelClassName}
                                  fontSize={labelMetrics.fontSize}
                                  x={labelMetrics.x}
                                  y={labelMetrics.y}
                                >
                                  {displayNumber}
                                </text>
                              )}
                              {resident && (
                                <g
                                  className={isKnownResident ? 'data-tick is-known' : 'data-tick'}
                                  transform={`translate(${unit.bounds.maxX - 12} ${unit.bounds.minY + 12})`}
                                  aria-hidden="true"
                                >
                                  <circle r="7" />
                                  <path d="M -3 0 L -0.8 2.6 L 4 -3.2" />
                                </g>
                              )}
                            </g>
                          )
                        })}
                      </g>
                    </svg>
                  </div>
                ) : (
                  <div className="loading-state">Loading building map</div>
                )}
              </div>
            </div>
          </section>
        </section>

        <section className="insight-grid">
          <article className="insight-panel">
            <div className="panel-title">
              <Route size={17} aria-hidden="true" />
              <span>Near Your Home</span>
            </div>
            {homeUnitId ? nearbyResidents.map((profile) => (
              <button className="nearby-row" key={profile.unitId} type="button" onClick={() => selectResidentUnit(profile.unitId)}>
                <span className={`mini-avatar tone-${getRelationshipTone(profile.relationship)}`}>
                  {getInitials(profile.names)}
                </span>
                <span>
                  <strong>{profile.names}</strong>
                  <small>Floor {profile.floorLabel} · {profile.socialStyle}</small>
                </span>
              </button>
            )) : (
              <div className="empty-insight">
                <Home size={18} aria-hidden="true" />
                <span>Select any apartment, then set it as your home base to see nearby people.</span>
              </div>
            )}
          </article>

          <article className="insight-panel">
            <div className="panel-title">
              <Lightbulb size={17} aria-hidden="true" />
              <span>Recent Memory</span>
            </div>
            {touchpoints.slice(0, 4).map((touchpoint) => {
              const profile = residentsByUnit.get(touchpoint.unitId)
              return (
                <button className="memory-row" key={touchpoint.id} type="button" onClick={() => selectResidentUnit(touchpoint.unitId)}>
                  <strong>{touchpoint.label}</strong>
                  <span>{profile ? `Apt ${profile.unitLabel}` : 'Apartment'} · {touchpoint.detail}</span>
                </button>
              )
            })}
          </article>

          <article className="insight-panel privacy-panel">
            <div className="panel-title">
              <ShieldCheck size={17} aria-hidden="true" />
              <span>Privacy Posture</span>
            </div>
            <p>
              The building map is separate from the resident memory layer. Keep real names, notes, and relationship history consented, exportable, and easy to delete.
            </p>
          </article>
        </section>

        <section className="plan-panel">
          <div>
            <p className="eyebrow">Build Plan</p>
            <h3>From prototype to real neighbor network</h3>
          </div>
          <div className="plan-grid">
            {buildPlan.map((item) => (
              <article className="plan-step" key={item.title}>
                <span>{item.phase}</span>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {drawerOpen && selectedUnit && (
        <>
          <button
            className="drawer-scrim"
            type="button"
            aria-label="Close apartment details"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="apartment-drawer" aria-label="Apartment details">
            <div className="drawer-header">
              <div className="profile-kicker">
                <MapPin size={16} aria-hidden="true" />
                <span>{unitLabel(selectedUnit, selectedAvailability, selectedResident)}</span>
              </div>
              <button className="icon-button" type="button" title="Close" aria-label="Close apartment details" onClick={() => setDrawerOpen(false)}>
                <X size={17} aria-hidden="true" />
              </button>
            </div>

            <button className="home-chip" type="button" onClick={() => setHomeUnitId(selectedUnit.id)}>
              <Home size={14} aria-hidden="true" />
              {homeUnitId === selectedUnit.id ? 'Home base set' : 'Set as my home'}
            </button>

            {selectedResident ? (
              <>
                <div className="profile-header">
                  <div className={`avatar tone-${getRelationshipTone(selectedScore)}`}>{getInitials(selectedResident.names)}</div>
                  <div>
                    <h3>{selectedResident.names}</h3>
                    <p>{stageLabels[selectedResident.stage]}</p>
                  </div>
                </div>

                <div className="relationship-meter">
                  <div>
                    <span>Relationship</span>
                    <strong>{selectedScore}%</strong>
                  </div>
                  <progress max="100" value={selectedScore} />
                </div>

                <dl className="profile-facts">
                  <div>
                    <dt><BriefcaseBusiness size={15} aria-hidden="true" /> Work</dt>
                    <dd>{selectedResident.work}</dd>
                  </div>
                  <div>
                    <dt><CalendarDays size={15} aria-hidden="true" /> Last touch</dt>
                    <dd>{selectedResident.lastTouch}</dd>
                  </div>
                  <div>
                    <dt><MessageCircle size={15} aria-hidden="true" /> Best channel</dt>
                    <dd>{selectedResident.preferredContact}</dd>
                  </div>
                  {(selectedResident.profileUrl || selectedResident.sourceLabel) && (
                    <div>
                      <dt><ExternalLink size={15} aria-hidden="true" /> Source</dt>
                      <dd>
                        {selectedResident.profileUrl ? (
                          <a href={selectedResident.profileUrl} target="_blank" rel="noreferrer">
                            {selectedResident.sourceLabel ?? 'View profile'}
                          </a>
                        ) : (
                          selectedResident.sourceLabel
                        )}
                      </dd>
                    </div>
                  )}
                </dl>

                <p className="profile-note">{selectedResident.note}</p>

                <div className="tag-list">
                  {selectedResident.interests.map((interest) => (
                    <span key={interest}>{interest}</span>
                  ))}
                </div>

                <div className="next-move">
                  <span>Next move</span>
                  <strong>{selectedResident.nextMove}</strong>
                </div>

                <div className="action-row">
                  <button type="button" onClick={() => logTouch(selectedResident.unitId, 5)}>
                    <Coffee size={16} aria-hidden="true" />
                    Coffee
                  </button>
                  <button type="button" onClick={() => logTouch(selectedResident.unitId, 7)}>
                    <HeartHandshake size={16} aria-hidden="true" />
                    Helped
                  </button>
                </div>

                <section className="drawer-section">
                  <div className="panel-title">
                    <UserPlus size={17} aria-hidden="true" />
                    <span>Intro Ideas</span>
                  </div>
                  {introSuggestions.map((profile) => (
                    <button
                      className="intro-row"
                      key={profile.unitId}
                      type="button"
                      onClick={() => selectResidentUnit(profile.unitId)}
                    >
                      <span className={`mini-avatar tone-${getRelationshipTone(profile.relationship)}`}>
                        {getInitials(profile.names)}
                      </span>
                      <span>
                        <strong>{profile.names}</strong>
                        <small>{profile.reason}</small>
                      </span>
                    </button>
                  ))}
                </section>
              </>
            ) : (
              <div className="empty-profile">
                <div className="avatar empty">
                  <Users size={22} aria-hidden="true" />
                </div>
                <h3>{selectedAvailability ? 'Open apartment' : 'Unknown neighbor'}</h3>
                <p>
                  {selectedAvailability
                    ? `${selectedAvailability.displayArea} · ${selectedAvailability.displayPrice} · ${selectedAvailability.displayAvailableOn}`
                    : 'No resident profile has been added for this apartment yet.'}
                </p>
                {selectedFloorPlan && (
                  <div className="availability-card">
                    <span>{selectedFloorPlan.name}</span>
                    <strong>{selectedFloorPlan.bedroomLabel} · {selectedFloorPlan.bathroomLabel}</strong>
                  </div>
                )}
                {residentFormOpen ? (
                  <form className="resident-form" onSubmit={saveResident}>
                    <label className="form-field">
                      <span>Name</span>
                      <input
                        autoFocus
                        required
                        value={residentForm.names}
                        onChange={(event) => updateResidentForm('names', event.target.value)}
                        placeholder="Alex Morgan"
                      />
                    </label>
                    <label className="form-field">
                      <span>Work</span>
                      <input
                        value={residentForm.work}
                        onChange={(event) => updateResidentForm('work', event.target.value)}
                        placeholder="Designer, founder, nurse..."
                      />
                    </label>
                    <label className="form-field">
                      <span>Interests</span>
                      <input
                        value={residentForm.interests}
                        onChange={(event) => updateResidentForm('interests', event.target.value)}
                        placeholder="coffee, plants, movies"
                      />
                    </label>
                    <label className="form-field">
                      <span>Best channel</span>
                      <input
                        value={residentForm.preferredContact}
                        onChange={(event) => updateResidentForm('preferredContact', event.target.value)}
                        placeholder="Text, building chat, in person"
                      />
                    </label>
                    <label className="form-field">
                      <span>First note</span>
                      <textarea
                        value={residentForm.note}
                        onChange={(event) => updateResidentForm('note', event.target.value)}
                        placeholder="What do you want to remember?"
                        rows={3}
                      />
                    </label>
                    <div className="form-actions">
                      <button className="compact-action" type="submit">
                        <UserPlus size={15} aria-hidden="true" />
                        Save resident
                      </button>
                      <button className="secondary-action" type="button" onClick={() => setResidentFormOpen(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button className="compact-action" type="button" onClick={startAddResident}>
                    <Users size={15} aria-hidden="true" />
                    Add resident
                  </button>
                )}
              </div>
            )}

            <section className="drawer-section">
              <div className="panel-title">
                <Users size={17} aria-hidden="true" />
                <span>Warmest Ties</span>
              </div>
              {visibleResidents.slice(0, 4).map((profile) => (
                <button
                  className={profile.unitId === selectedUnitId ? 'connection-row active' : 'connection-row'}
                  key={profile.unitId}
                  type="button"
                  onClick={() => selectResidentUnit(profile.unitId)}
                >
                  <span className={`mini-avatar tone-${getRelationshipTone(profile.adjustedRelationship)}`}>
                    {getInitials(profile.names)}
                  </span>
                  <span>
                    <strong>{profile.names}</strong>
                    <small>Apt {profile.unitLabel} · {profile.adjustedRelationship}%</small>
                  </span>
                </button>
              ))}
            </section>
          </aside>
        </>
      )}
    </div>
  )
}

export default App
