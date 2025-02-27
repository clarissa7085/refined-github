import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import features from '../libs/features';

function generateSubmenu(hideButton: Element): void {
	if (hideButton.closest('.rgh-hide-comments-faster-details')) {
		// Already generated
		return;
	}

	const detailsElement = hideButton.closest('details')!;
	detailsElement.classList.add('rgh-hide-comments-faster-details');

	const comment = hideButton.closest('.unminimized-comment')!;
	const hideCommentForm = select('.js-comment-minimize', comment)!;

	// Generate dropdown items
	for (const reason of select.all<HTMLInputElement>('[name="classifier"] :not([value=""])', comment)) {
		hideCommentForm.append(
			<button
				name="classifier"
				value={reason.value}
				className="dropdown-item btn-link"
				role="menuitem">
				{reason.textContent}
			</button>
		);
	}

	// Drop previous form controls
	select('.btn', hideCommentForm)!.remove();
	select('[name="classifier"]', hideCommentForm)!.remove();

	// Imitate existing menu
	hideCommentForm.classList.add('dropdown-menu', 'dropdown-menu-sw', 'text-gray-dark', 'show-more-popover', 'anim-scale-in');

	detailsElement.append(hideCommentForm);
}

// Shows menu on top of mainDropdownContent when "Hide" is clicked;
// Hide it when dropdown closes.
// Uses `v-hidden` and `d-none` to avoid conflicts with `close-out-of-view-modals`
function toggleSubMenu(hideButton: Element, show: boolean): void {
	const dropdown = hideButton.closest('details')!;

	// Native dropdown
	select('details-menu', dropdown)!.classList.toggle('v-hidden', show);

	// "Hide comment" dropdown
	select('form.js-comment-minimize', dropdown)!.classList.toggle('d-none', !show);
}

function resetDropdowns(event: DelegateEvent): void {
	toggleSubMenu(event.delegateTarget, false);
}

function showSubmenu(event: DelegateEvent): void {
	generateSubmenu(event.delegateTarget);
	toggleSubMenu(event.delegateTarget, true);

	event.stopImmediatePropagation();
	event.preventDefault();
}

function init(): void {
	// `useCapture` required to be fired before GitHub's handlers
	delegate('.js-comment-hide-button', 'click', showSubmenu, true);
	delegate('.rgh-hide-comments-faster-details', 'toggle', resetDropdowns, true);
}

features.add({
	id: __featureName__,
	description: 'Simplifies the UI to hide comments.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/43039221-1ddc91f6-8d29-11e8-9ed4-93459191a510.gif',
	include: [
		features.hasComments
	],
	load: features.onAjaxedPages,
	init
});
