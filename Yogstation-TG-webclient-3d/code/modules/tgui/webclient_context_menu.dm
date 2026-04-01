/**
 * Webclient Context Menu
 *
 * Webclient alternative as it can not use Byond Right click 
 * Only did the basic verbs for testing it out
 */
/datum/webclient_context_menu
	var/mob/owner
	
	var/atom/target

/datum/webclient_context_menu/New(mob/new_owner, atom/new_target)
	if(!new_owner || !new_target)
		qdel(src)
		return
	owner = new_owner
	target = new_target

/datum/webclient_context_menu/Destroy()
	owner = null
	target = null
	return ..()

/datum/webclient_context_menu/ui_state(mob/user)
	return GLOB.always_state

/datum/webclient_context_menu/ui_interact(mob/user, datum/tgui/ui)
	ui = SStgui.try_update_ui(user, src, ui)
	if(!ui)
		ui = new(user, src, "WebclientContextMenu")
		ui.open()
		ui.set_autoupdate(FALSE)

/datum/webclient_context_menu/ui_data(mob/user)
	var/list/data = list()

	if(QDELETED(target))
		data["target_name"] = "Nothing"
		data["actions"] = list()
		return data

	data["target_name"] = target.name
	data["target_ref"] = REF(target)

	var/list/actions = list()
	var/is_adjacent = user.Adjacent(target)

	actions += list(list(
		"name" = "Examine",
		"action" = "examine",
		"enabled" = TRUE
	))

	if(isitem(target) && is_adjacent)
		actions += list(list(
			"name" = "Pick Up",
			"action" = "pickup",
			"enabled" = TRUE
		))

	if(ismovable(target) && is_adjacent)
		actions += list(list(
			"name" = "Pull",
			"action" = "pull",
			"enabled" = TRUE
		))

	actions += list(list(
		"name" = "Point",
		"action" = "point",
		"enabled" = TRUE
	))

	if(is_adjacent)
		actions += list(list(
			"name" = "Use",
			"action" = "use",
			"enabled" = TRUE
		))

	data["actions"] = actions
	return data

/datum/webclient_context_menu/ui_act(action, params)
	. = ..()
	if(.)
		return

	if(QDELETED(target) || QDELETED(owner))
		return

	switch(action)
		if("examine")
			owner.examinate(target)
		if("pickup")
			if(isitem(target) && owner.Adjacent(target))				
				owner.ClickOn(target, "left=1")
		if("pull")
			if(ismovable(target) && owner.Adjacent(target) && isliving(owner))
				var/mob/living/L = owner
				L.start_pulling(target)
		if("point")
			owner.pointed(target)
		if("use")
			if(owner.Adjacent(target))
				owner.ClickOn(target, "left=1")

	SStgui.close_uis(src)
	return TRUE

/mob/proc/webclient_context_menu(atom/A)
	var/datum/webclient_context_menu/menu = new(src, A)
	menu.ui_interact(src)
