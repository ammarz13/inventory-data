import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useDispatch } from 'react-redux'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import PageTransition from '../common/PageTransition'
import { selectSidebarOpen, selectSidebarMobileOpen, setSidebarMobile } from '../../store/uiSlice'

export default function DashboardLayout() {
  const sidebarOpen = useSelector(selectSidebarOpen)
  const mobileOpen = useSelector(selectSidebarMobileOpen)
  const dispatch = useDispatch()
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        {sidebarOpen && <Sidebar />}
      </div>

      {/* Mobile Sidebar Drawer */}
      <Transition show={mobileOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={() => dispatch(setSidebarMobile(false))}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in-out duration-300" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>
          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-300" enterFrom="-translate-x-full" enterTo="translate-x-0"
              leave="ease-in-out duration-300" leaveFrom="translate-x-0" leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="w-64 flex-col">
                <Sidebar mobile />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
