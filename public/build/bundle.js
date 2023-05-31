
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$1() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop$1;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind$1(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop$1,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$1;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop$1;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/HandlingForm.svelte generated by Svelte v3.59.1 */

    const file$6 = "src/HandlingForm.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let body;
    	let h1;
    	let t1;
    	let form;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let label2;
    	let t8;
    	let div0;
    	let t10;
    	let div1;
    	let t11;
    	let br0;
    	let br1;
    	let t12;
    	let br2;
    	let br3;
    	let t13;
    	let t14;
    	let textarea;
    	let t15;
    	let div6;
    	let label3;
    	let t16;
    	let div4;
    	let div3;
    	let t18;
    	let br4;
    	let br5;
    	let t19;
    	let br6;
    	let br7;
    	let t20;
    	let t21;
    	let div5;
    	let label4;
    	let t23;
    	let input2;
    	let t24;
    	let input3;
    	let t25;
    	let button0;
    	let t27;
    	let label5;
    	let t29;
    	let input4;
    	let t30;
    	let div10;
    	let label6;
    	let t31;
    	let div7;
    	let t33;
    	let div8;
    	let t34;
    	let br8;
    	let br9;
    	let t35;
    	let t36;
    	let div9;
    	let label7;
    	let t38;
    	let input5;
    	let t39;
    	let input6;
    	let t40;
    	let button1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			body = element("body");
    			h1 = element("h1");
    			h1.textContent = "Handling";
    			t1 = space();
    			form = element("form");
    			label0 = element("label");
    			label0.textContent = "Titel:";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			label1.textContent = "Möte:";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			t8 = text("Brödtext:\n                        ");
    			div0 = element("div");
    			div0.textContent = "?";
    			t10 = space();
    			div1 = element("div");
    			t11 = text("Brödtexten är den inledande texten i\n                            motionen/propositionen.\n                            ");
    			br0 = element("br");
    			br1 = element("br");
    			t12 = text("\n                            Syftet med brödtexten är att förklara bakgrunden till att-satserna,\n                            samt att motivera dem.\n                            ");
    			br2 = element("br");
    			br3 = element("br");
    			t13 = text("\n                            Pro tip! Här kan du skriva ren LaTeX-kod om du vill!");
    			t14 = space();
    			textarea = element("textarea");
    			t15 = space();
    			div6 = element("div");
    			label3 = element("label");
    			t16 = text("Att-satser:\n                        ");
    			div4 = element("div");
    			div3 = element("div");
    			div3.textContent = "?";
    			t18 = text("\n                            Förändringar du tycker sektionen ska genomföra skrivs i form\n                            av att-satser. Ett exempel kan vara \"Att sektionen ska sjunga\n                            mer på ...\".\n                            ");
    			br4 = element("br");
    			br5 = element("br");
    			t19 = text("\n                            Observera att du inte behöver skriva \"att\" i början av din\n                            att-sats, detta läggs till automatiskt.\n                            ");
    			br6 = element("br");
    			br7 = element("br");
    			t20 = text("\n                            Om du vill kan du även lägga till en beskrivning av din att-sats.\n                            Ofta är det dock onödigt, eftersom att-satsen i sig bör vara\n                            tillräckligt tydlig, samt att den bör förklaras i brödtexten.");
    			t21 = space();
    			div5 = element("div");
    			label4 = element("label");
    			label4.textContent = "1";
    			t23 = space();
    			input2 = element("input");
    			t24 = space();
    			input3 = element("input");
    			t25 = space();
    			button0 = element("button");
    			button0.textContent = "Lägg till att-sats";
    			t27 = space();
    			label5 = element("label");
    			label5.textContent = "Signaturmeddelande:";
    			t29 = space();
    			input4 = element("input");
    			t30 = space();
    			div10 = element("div");
    			label6 = element("label");
    			t31 = text("Författare:\n                        ");
    			div7 = element("div");
    			div7.textContent = "?";
    			t33 = space();
    			div8 = element("div");
    			t34 = text("Vilka är det som skrivit motionen/propositionen? Lägg\n                            till det här!\n                            ");
    			br8 = element("br");
    			br9 = element("br");
    			t35 = text("\n                            Ibland vill man påtrycka att en motion/proposition är skriven\n                            av någon som innehar en viss post. Detta är inget måste,\n                            utan du kan lämna det blankt eller skriva t.ex. \"Sektionsmedlem\"\n                            också.");
    			t36 = space();
    			div9 = element("div");
    			label7 = element("label");
    			label7.textContent = "1";
    			t38 = space();
    			input5 = element("input");
    			t39 = space();
    			input6 = element("input");
    			t40 = space();
    			button1 = element("button");
    			button1.textContent = "Lägg till författare";
    			add_location(h1, file$6, 4, 12, 67);
    			attr_dev(label0, "for", "title");
    			attr_dev(label0, "class", "svelte-19snpur");
    			add_location(label0, file$6, 6, 16, 138);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "title");
    			attr_dev(input0, "id", "title");
    			attr_dev(input0, "placeholder", "Titel");
    			attr_dev(input0, "class", "svelte-19snpur");
    			add_location(input0, file$6, 7, 16, 188);
    			attr_dev(label1, "for", "meeting");
    			attr_dev(label1, "class", "svelte-19snpur");
    			add_location(label1, file$6, 8, 16, 270);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "meeting");
    			attr_dev(input1, "id", "meeting");
    			attr_dev(input1, "placeholder", "t.ex. VTM, S05");
    			attr_dev(input1, "class", "svelte-19snpur");
    			add_location(input1, file$6, 9, 16, 321);
    			attr_dev(div0, "class", "info-circle svelte-19snpur");
    			add_location(div0, file$6, 18, 24, 649);
    			add_location(br0, file$6, 22, 28, 877);
    			add_location(br1, file$6, 22, 34, 883);
    			add_location(br2, file$6, 25, 28, 1065);
    			add_location(br3, file$6, 25, 34, 1071);
    			attr_dev(div1, "class", "explanation svelte-19snpur");
    			add_location(div1, file$6, 19, 24, 706);
    			attr_dev(label2, "for", "body");
    			attr_dev(label2, "id", "bodyLabel");
    			attr_dev(label2, "class", "svelte-19snpur");
    			add_location(label2, file$6, 16, 20, 557);
    			attr_dev(textarea, "name", "body");
    			attr_dev(textarea, "id", "body");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			attr_dev(textarea, "placeholder", "Jag tycker att det sjungs för lite på...");
    			attr_dev(textarea, "class", "svelte-19snpur");
    			add_location(textarea, file$6, 29, 20, 1239);
    			attr_dev(div2, "id", "bodyContainer");
    			attr_dev(div2, "class", "svelte-19snpur");
    			add_location(div2, file$6, 15, 16, 512);
    			attr_dev(div3, "class", "info-circle svelte-19snpur");
    			add_location(div3, file$6, 42, 28, 1703);
    			add_location(br4, file$6, 46, 28, 1984);
    			add_location(br5, file$6, 46, 34, 1990);
    			add_location(br6, file$6, 49, 28, 2180);
    			add_location(br7, file$6, 49, 34, 2186);
    			attr_dev(div4, "class", "explanation svelte-19snpur");
    			add_location(div4, file$6, 41, 24, 1649);
    			attr_dev(label3, "class", "svelte-19snpur");
    			add_location(label3, file$6, 39, 20, 1581);
    			attr_dev(label4, "for", "clause1");
    			attr_dev(label4, "class", "svelte-19snpur");
    			add_location(label4, file$6, 56, 24, 2597);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "clause");
    			attr_dev(input2, "id", "clause1");
    			attr_dev(input2, "placeholder", "Att-sats");
    			attr_dev(input2, "class", "svelte-19snpur");
    			add_location(input2, file$6, 57, 24, 2652);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "description");
    			attr_dev(input3, "id", "description1");
    			attr_dev(input3, "placeholder", "Beskrivning (frivillig)");
    			attr_dev(input3, "class", "svelte-19snpur");
    			add_location(input3, file$6, 63, 24, 2884);
    			attr_dev(div5, "class", "clauseFields");
    			add_location(div5, file$6, 55, 20, 2546);
    			attr_dev(div6, "id", "clausesContainer");
    			attr_dev(div6, "class", "svelte-19snpur");
    			add_location(div6, file$6, 38, 16, 1533);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "id", "addClauseButton");
    			attr_dev(button0, "class", "svelte-19snpur");
    			add_location(button0, file$6, 71, 16, 3183);
    			attr_dev(label5, "for", "signMessage");
    			attr_dev(label5, "class", "svelte-19snpur");
    			add_location(label5, file$6, 75, 16, 3313);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "name", "signMessage");
    			attr_dev(input4, "id", "signMessage");
    			attr_dev(input4, "placeholder", "För D-sektionen,");
    			attr_dev(input4, "class", "svelte-19snpur");
    			add_location(input4, file$6, 76, 16, 3382);
    			attr_dev(div7, "class", "info-circle svelte-19snpur");
    			add_location(div7, file$6, 86, 24, 3704);
    			add_location(br8, file$6, 90, 28, 3939);
    			add_location(br9, file$6, 90, 34, 3945);
    			attr_dev(div8, "class", "explanation svelte-19snpur");
    			add_location(div8, file$6, 87, 24, 3761);
    			attr_dev(label6, "class", "svelte-19snpur");
    			add_location(label6, file$6, 84, 20, 3636);
    			attr_dev(label7, "for", "author1");
    			attr_dev(label7, "class", "svelte-19snpur");
    			add_location(label7, file$6, 98, 24, 4386);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "name", "name");
    			attr_dev(input5, "id", "name1");
    			attr_dev(input5, "placeholder", "Namn");
    			attr_dev(input5, "class", "svelte-19snpur");
    			add_location(input5, file$6, 99, 24, 4441);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "name", "position");
    			attr_dev(input6, "id", "position1");
    			attr_dev(input6, "placeholder", "Post (frivillig)");
    			attr_dev(input6, "class", "svelte-19snpur");
    			add_location(input6, file$6, 105, 24, 4665);
    			attr_dev(div9, "class", "authorFields");
    			add_location(div9, file$6, 97, 20, 4335);
    			attr_dev(div10, "id", "authorsContainer");
    			attr_dev(div10, "class", "svelte-19snpur");
    			add_location(div10, file$6, 83, 16, 3588);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "id", "addAuthorButton");
    			attr_dev(button1, "class", "svelte-19snpur");
    			add_location(button1, file$6, 113, 16, 4951);
    			attr_dev(form, "id", "documentform");
    			attr_dev(form, "class", "svelte-19snpur");
    			add_location(form, file$6, 5, 12, 97);
    			attr_dev(body, "class", "svelte-19snpur");
    			add_location(body, file$6, 3, 8, 48);
    			add_location(main, file$6, 2, 4, 33);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, body);
    			append_dev(body, h1);
    			append_dev(body, t1);
    			append_dev(body, form);
    			append_dev(form, label0);
    			append_dev(form, t3);
    			append_dev(form, input0);
    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(form, t6);
    			append_dev(form, input1);
    			append_dev(form, t7);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(label2, t8);
    			append_dev(label2, div0);
    			append_dev(label2, t10);
    			append_dev(label2, div1);
    			append_dev(div1, t11);
    			append_dev(div1, br0);
    			append_dev(div1, br1);
    			append_dev(div1, t12);
    			append_dev(div1, br2);
    			append_dev(div1, br3);
    			append_dev(div1, t13);
    			append_dev(div2, t14);
    			append_dev(div2, textarea);
    			append_dev(form, t15);
    			append_dev(form, div6);
    			append_dev(div6, label3);
    			append_dev(label3, t16);
    			append_dev(label3, div4);
    			append_dev(div4, div3);
    			append_dev(div4, t18);
    			append_dev(div4, br4);
    			append_dev(div4, br5);
    			append_dev(div4, t19);
    			append_dev(div4, br6);
    			append_dev(div4, br7);
    			append_dev(div4, t20);
    			append_dev(div6, t21);
    			append_dev(div6, div5);
    			append_dev(div5, label4);
    			append_dev(div5, t23);
    			append_dev(div5, input2);
    			append_dev(div5, t24);
    			append_dev(div5, input3);
    			append_dev(form, t25);
    			append_dev(form, button0);
    			append_dev(form, t27);
    			append_dev(form, label5);
    			append_dev(form, t29);
    			append_dev(form, input4);
    			append_dev(form, t30);
    			append_dev(form, div10);
    			append_dev(div10, label6);
    			append_dev(label6, t31);
    			append_dev(label6, div7);
    			append_dev(label6, t33);
    			append_dev(label6, div8);
    			append_dev(div8, t34);
    			append_dev(div8, br8);
    			append_dev(div8, br9);
    			append_dev(div8, t35);
    			append_dev(div10, t36);
    			append_dev(div10, div9);
    			append_dev(div9, label7);
    			append_dev(div9, t38);
    			append_dev(div9, input5);
    			append_dev(div9, t39);
    			append_dev(div9, input6);
    			append_dev(form, t40);
    			append_dev(form, button1);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HandlingForm', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HandlingForm> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class HandlingForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HandlingForm",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Author.svelte generated by Svelte v3.59.1 */

    const file$5 = "src/Author.svelte";

    // (17:4) {#if !first}
    function create_if_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Ta bort författare";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "id", "removeAuthorButton");
    			attr_dev(button, "class", "svelte-cz9wbc");
    			set_style(button, "hover", `background-color: #f44336;`);
    			add_location(button, file$5, 17, 8, 428);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false, false);
    				mounted = true;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(17:4) {#if !first}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let mounted;
    	let dispose;
    	let if_block = !/*first*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "placeholder", "Namn");
    			attr_dev(input0, "class", "svelte-cz9wbc");
    			add_location(input0, file$5, 8, 8, 170);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "position");
    			attr_dev(input1, "placeholder", "Post (frivillig)");
    			attr_dev(input1, "class", "svelte-cz9wbc");
    			add_location(input1, file$5, 9, 8, 247);
    			attr_dev(div0, "class", "author-text svelte-cz9wbc");
    			add_location(div0, file$5, 7, 4, 136);
    			attr_dev(div1, "class", "author svelte-cz9wbc");
    			add_location(div1, file$5, 6, 0, 111);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*name*/ ctx[0]);
    			append_dev(div0, t0);
    			append_dev(div0, input1);
    			set_input_value(input1, /*position*/ ctx[1]);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && input0.value !== /*name*/ ctx[0]) {
    				set_input_value(input0, /*name*/ ctx[0]);
    			}

    			if (dirty & /*position*/ 2 && input1.value !== /*position*/ ctx[1]) {
    				set_input_value(input1, /*position*/ ctx[1]);
    			}

    			if (!/*first*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Author', slots, []);
    	let { first } = $$props;
    	let { name } = $$props;
    	let { position } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (first === undefined && !('first' in $$props || $$self.$$.bound[$$self.$$.props['first']])) {
    			console.warn("<Author> was created without expected prop 'first'");
    		}

    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<Author> was created without expected prop 'name'");
    		}

    		if (position === undefined && !('position' in $$props || $$self.$$.bound[$$self.$$.props['position']])) {
    			console.warn("<Author> was created without expected prop 'position'");
    		}
    	});

    	const writable_props = ['first', 'name', 'position'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Author> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	function input1_input_handler() {
    		position = this.value;
    		$$invalidate(1, position);
    	}

    	$$self.$$set = $$props => {
    		if ('first' in $$props) $$invalidate(2, first = $$props.first);
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('position' in $$props) $$invalidate(1, position = $$props.position);
    	};

    	$$self.$capture_state = () => ({ first, name, position });

    	$$self.$inject_state = $$props => {
    		if ('first' in $$props) $$invalidate(2, first = $$props.first);
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('position' in $$props) $$invalidate(1, position = $$props.position);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		position,
    		first,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Author extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { first: 2, name: 0, position: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Author",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get first() {
    		throw new Error("<Author>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set first(value) {
    		throw new Error("<Author>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Author>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Author>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<Author>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<Author>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Clause.svelte generated by Svelte v3.59.1 */

    const file$4 = "src/Clause.svelte";

    // (21:4) {#if !first}
    function create_if_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Ta bort att-sats";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "id", "removeClauseButton");
    			attr_dev(button, "class", "svelte-zhw2cy");
    			set_style(button, "hover", `background-color: #f44336;`);
    			add_location(button, file$4, 21, 8, 517);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[3], false, false, false, false);
    				mounted = true;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(21:4) {#if !first}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let mounted;
    	let dispose;
    	let if_block = !/*first*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "clause-text");
    			attr_dev(input0, "placeholder", "sjung mer på...");
    			attr_dev(input0, "class", "svelte-zhw2cy");
    			add_location(input0, file$4, 7, 8, 157);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "description-text");
    			attr_dev(input1, "placeholder", "Beskrivning (frivillig)");
    			attr_dev(input1, "class", "svelte-zhw2cy");
    			add_location(input1, file$4, 13, 8, 314);
    			attr_dev(div0, "class", "clause-text svelte-zhw2cy");
    			add_location(div0, file$4, 6, 4, 123);
    			attr_dev(div1, "class", "clause svelte-zhw2cy");
    			add_location(div1, file$4, 5, 0, 98);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*clauseText*/ ctx[0]);
    			append_dev(div0, t0);
    			append_dev(div0, input1);
    			set_input_value(input1, /*descriptionText*/ ctx[1]);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*clauseText*/ 1 && input0.value !== /*clauseText*/ ctx[0]) {
    				set_input_value(input0, /*clauseText*/ ctx[0]);
    			}

    			if (dirty & /*descriptionText*/ 2 && input1.value !== /*descriptionText*/ ctx[1]) {
    				set_input_value(input1, /*descriptionText*/ ctx[1]);
    			}

    			if (!/*first*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Clause', slots, []);
    	let { first } = $$props;
    	let { clauseText } = $$props;
    	let { descriptionText } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (first === undefined && !('first' in $$props || $$self.$$.bound[$$self.$$.props['first']])) {
    			console.warn("<Clause> was created without expected prop 'first'");
    		}

    		if (clauseText === undefined && !('clauseText' in $$props || $$self.$$.bound[$$self.$$.props['clauseText']])) {
    			console.warn("<Clause> was created without expected prop 'clauseText'");
    		}

    		if (descriptionText === undefined && !('descriptionText' in $$props || $$self.$$.bound[$$self.$$.props['descriptionText']])) {
    			console.warn("<Clause> was created without expected prop 'descriptionText'");
    		}
    	});

    	const writable_props = ['first', 'clauseText', 'descriptionText'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Clause> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input0_input_handler() {
    		clauseText = this.value;
    		$$invalidate(0, clauseText);
    	}

    	function input1_input_handler() {
    		descriptionText = this.value;
    		$$invalidate(1, descriptionText);
    	}

    	$$self.$$set = $$props => {
    		if ('first' in $$props) $$invalidate(2, first = $$props.first);
    		if ('clauseText' in $$props) $$invalidate(0, clauseText = $$props.clauseText);
    		if ('descriptionText' in $$props) $$invalidate(1, descriptionText = $$props.descriptionText);
    	};

    	$$self.$capture_state = () => ({ first, clauseText, descriptionText });

    	$$self.$inject_state = $$props => {
    		if ('first' in $$props) $$invalidate(2, first = $$props.first);
    		if ('clauseText' in $$props) $$invalidate(0, clauseText = $$props.clauseText);
    		if ('descriptionText' in $$props) $$invalidate(1, descriptionText = $$props.descriptionText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		clauseText,
    		descriptionText,
    		first,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Clause extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			first: 2,
    			clauseText: 0,
    			descriptionText: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clause",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get first() {
    		throw new Error("<Clause>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set first(value) {
    		throw new Error("<Clause>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clauseText() {
    		throw new Error("<Clause>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clauseText(value) {
    		throw new Error("<Clause>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get descriptionText() {
    		throw new Error("<Clause>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set descriptionText(value) {
    		throw new Error("<Clause>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop$1) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop$1) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop$1;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src/MotionForm.svelte generated by Svelte v3.59.1 */

    const { Object: Object_1, console: console_1$1 } = globals;
    const file$3 = "src/MotionForm.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	child_ctx[30] = list;
    	child_ctx[31] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	child_ctx[33] = list;
    	child_ctx[31] = i;
    	return child_ctx;
    }

    // (103:20) {#each $clauses as clause, index (clause.uuid)}
    function create_each_block_1(key_1, ctx) {
    	let p;
    	let t0_value = /*index*/ ctx[31] + 1 + "";
    	let t0;
    	let t1;
    	let clause;
    	let updating_clauseText;
    	let updating_descriptionText;
    	let current;

    	function clause_clauseText_binding(value) {
    		/*clause_clauseText_binding*/ ctx[17](value, /*clause*/ ctx[32]);
    	}

    	function clause_descriptionText_binding(value) {
    		/*clause_descriptionText_binding*/ ctx[18](value, /*clause*/ ctx[32]);
    	}

    	function click_handler() {
    		return /*click_handler*/ ctx[19](/*clause*/ ctx[32]);
    	}

    	let clause_props = { first: /*index*/ ctx[31] === 0 };

    	if (/*clause*/ ctx[32].clauseText !== void 0) {
    		clause_props.clauseText = /*clause*/ ctx[32].clauseText;
    	}

    	if (/*clause*/ ctx[32].descriptionText !== void 0) {
    		clause_props.descriptionText = /*clause*/ ctx[32].descriptionText;
    	}

    	clause = new Clause({ props: clause_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(clause, 'clauseText', clause_clauseText_binding));
    	binding_callbacks.push(() => bind$1(clause, 'descriptionText', clause_descriptionText_binding));
    	clause.$on("click", click_handler);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(clause.$$.fragment);
    			add_location(p, file$3, 103, 20, 3261);
    			this.first = p;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    			mount_component(clause, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty[0] & /*$clauses*/ 32) && t0_value !== (t0_value = /*index*/ ctx[31] + 1 + "")) set_data_dev(t0, t0_value);
    			const clause_changes = {};
    			if (dirty[0] & /*$clauses*/ 32) clause_changes.first = /*index*/ ctx[31] === 0;

    			if (!updating_clauseText && dirty[0] & /*$clauses*/ 32) {
    				updating_clauseText = true;
    				clause_changes.clauseText = /*clause*/ ctx[32].clauseText;
    				add_flush_callback(() => updating_clauseText = false);
    			}

    			if (!updating_descriptionText && dirty[0] & /*$clauses*/ 32) {
    				updating_descriptionText = true;
    				clause_changes.descriptionText = /*clause*/ ctx[32].descriptionText;
    				add_flush_callback(() => updating_descriptionText = false);
    			}

    			clause.$set(clause_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clause.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clause.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			destroy_component(clause, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(103:20) {#each $clauses as clause, index (clause.uuid)}",
    		ctx
    	});

    	return block;
    }

    // (130:20) {#each $authors as author, index (author.uuid)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let author;
    	let updating_name;
    	let updating_position;
    	let current;

    	function author_name_binding(value) {
    		/*author_name_binding*/ ctx[21](value, /*author*/ ctx[29]);
    	}

    	function author_position_binding(value) {
    		/*author_position_binding*/ ctx[22](value, /*author*/ ctx[29]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[23](/*author*/ ctx[29]);
    	}

    	let author_props = { first: /*index*/ ctx[31] === 0 };

    	if (/*author*/ ctx[29].name !== void 0) {
    		author_props.name = /*author*/ ctx[29].name;
    	}

    	if (/*author*/ ctx[29].position !== void 0) {
    		author_props.position = /*author*/ ctx[29].position;
    	}

    	author = new Author({ props: author_props, $$inline: true });
    	binding_callbacks.push(() => bind$1(author, 'name', author_name_binding));
    	binding_callbacks.push(() => bind$1(author, 'position', author_position_binding));
    	author.$on("click", click_handler_1);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(author.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(author, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const author_changes = {};
    			if (dirty[0] & /*$authors*/ 16) author_changes.first = /*index*/ ctx[31] === 0;

    			if (!updating_name && dirty[0] & /*$authors*/ 16) {
    				updating_name = true;
    				author_changes.name = /*author*/ ctx[29].name;
    				add_flush_callback(() => updating_name = false);
    			}

    			if (!updating_position && dirty[0] & /*$authors*/ 16) {
    				updating_position = true;
    				author_changes.position = /*author*/ ctx[29].position;
    				add_flush_callback(() => updating_position = false);
    			}

    			author.$set(author_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(author.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(author.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(author, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(130:20) {#each $authors as author, index (author.uuid)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
    	let body_1;
    	let h1;
    	let t1;
    	let form;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let label2;
    	let t8;
    	let div0;
    	let t10;
    	let div1;
    	let t11;
    	let br0;
    	let br1;
    	let t12;
    	let br2;
    	let br3;
    	let t13;
    	let t14;
    	let textarea;
    	let t15;
    	let div4;
    	let h20;
    	let t17;
    	let div3;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t18;
    	let button0;
    	let t20;
    	let label3;
    	let t22;
    	let input2;
    	let t23;
    	let div6;
    	let h21;
    	let t25;
    	let div5;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let t26;
    	let button1;
    	let t28;
    	let button2;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*$clauses*/ ctx[5];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*clause*/ ctx[32].uuid;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*$authors*/ ctx[4];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*author*/ ctx[29].uuid;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			body_1 = element("body");
    			h1 = element("h1");
    			h1.textContent = "Motion";
    			t1 = space();
    			form = element("form");
    			label0 = element("label");
    			label0.textContent = "Titel:";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			label1.textContent = "Möte:";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			t8 = text("Brödtext:\n                    ");
    			div0 = element("div");
    			div0.textContent = "?";
    			t10 = space();
    			div1 = element("div");
    			t11 = text("Brödtexten är den inledande texten i\n                        motionen/propositionen.\n                        ");
    			br0 = element("br");
    			br1 = element("br");
    			t12 = text("\n                        Syftet med brödtexten är att förklara bakgrunden till att-satserna,\n                        samt att motivera dem.\n                        ");
    			br2 = element("br");
    			br3 = element("br");
    			t13 = text("\n                        Pro tip! Här kan du skriva ren LaTeX-kod om du vill!");
    			t14 = space();
    			textarea = element("textarea");
    			t15 = space();
    			div4 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Att-satser";
    			t17 = space();
    			div3 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t18 = space();
    			button0 = element("button");
    			button0.textContent = "Lägg till att-sats";
    			t20 = space();
    			label3 = element("label");
    			label3.textContent = "Signaturmeddelande:";
    			t22 = space();
    			input2 = element("input");
    			t23 = space();
    			div6 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Författare";
    			t25 = space();
    			div5 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t26 = space();
    			button1 = element("button");
    			button1.textContent = "Lägg till författare";
    			t28 = space();
    			button2 = element("button");
    			button2.textContent = "Generera motion!";
    			add_location(h1, file$3, 63, 8, 1635);
    			attr_dev(label0, "for", "title");
    			attr_dev(label0, "class", "svelte-ua6zjf");
    			add_location(label0, file$3, 65, 12, 1696);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "title");
    			attr_dev(input0, "id", "title");
    			attr_dev(input0, "placeholder", "Titel");
    			attr_dev(input0, "class", "svelte-ua6zjf");
    			add_location(input0, file$3, 66, 12, 1742);
    			attr_dev(label1, "for", "meeting");
    			attr_dev(label1, "class", "svelte-ua6zjf");
    			add_location(label1, file$3, 67, 12, 1838);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "meeting");
    			attr_dev(input1, "id", "meeting");
    			attr_dev(input1, "placeholder", "t.ex. VTM, S05");
    			attr_dev(input1, "class", "svelte-ua6zjf");
    			add_location(input1, file$3, 68, 12, 1885);
    			attr_dev(div0, "class", "info-circle svelte-ua6zjf");
    			add_location(div0, file$3, 78, 20, 2214);
    			add_location(br0, file$3, 82, 24, 2426);
    			add_location(br1, file$3, 82, 30, 2432);
    			add_location(br2, file$3, 85, 24, 2602);
    			add_location(br3, file$3, 85, 30, 2608);
    			attr_dev(div1, "class", "explanation svelte-ua6zjf");
    			add_location(div1, file$3, 79, 20, 2267);
    			attr_dev(label2, "for", "body");
    			attr_dev(label2, "id", "bodyLabel");
    			attr_dev(label2, "class", "svelte-ua6zjf");
    			add_location(label2, file$3, 76, 16, 2130);
    			attr_dev(textarea, "name", "body");
    			attr_dev(textarea, "id", "body");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			attr_dev(textarea, "placeholder", "Jag tycker att det sjungs för lite på...");
    			attr_dev(textarea, "class", "svelte-ua6zjf");
    			add_location(textarea, file$3, 89, 16, 2760);
    			attr_dev(div2, "id", "bodyContainer");
    			attr_dev(div2, "class", "svelte-ua6zjf");
    			add_location(div2, file$3, 75, 12, 2089);
    			add_location(h20, file$3, 100, 16, 3106);
    			attr_dev(div3, "class", "clause-container svelte-ua6zjf");
    			add_location(div3, file$3, 101, 16, 3142);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "id", "addClauseButton");
    			attr_dev(button0, "class", "svelte-ua6zjf");
    			add_location(button0, file$3, 112, 16, 3663);
    			attr_dev(div4, "id", "outer-clause-container");
    			attr_dev(div4, "class", "svelte-ua6zjf");
    			add_location(div4, file$3, 99, 12, 3056);
    			attr_dev(label3, "for", "signMessage");
    			attr_dev(label3, "class", "svelte-ua6zjf");
    			add_location(label3, file$3, 117, 12, 3817);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "signMessage");
    			attr_dev(input2, "id", "signMessage");
    			attr_dev(input2, "placeholder", "För D-sektionen,");
    			attr_dev(input2, "class", "svelte-ua6zjf");
    			add_location(input2, file$3, 118, 12, 3882);
    			add_location(h21, file$3, 127, 16, 4151);
    			attr_dev(div5, "class", "authorsContainer");
    			add_location(div5, file$3, 128, 16, 4187);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "id", "addAuthorButton");
    			attr_dev(button1, "class", "svelte-ua6zjf");
    			add_location(button1, file$3, 138, 16, 4643);
    			attr_dev(div6, "id", "outer-author-container");
    			attr_dev(div6, "class", "svelte-ua6zjf");
    			add_location(div6, file$3, 126, 12, 4101);
    			attr_dev(form, "id", "documentform");
    			attr_dev(form, "class", "svelte-ua6zjf");
    			add_location(form, file$3, 64, 8, 1659);
    			attr_dev(button2, "class", "generateButton svelte-ua6zjf");
    			add_location(button2, file$3, 143, 8, 4818);
    			attr_dev(body_1, "class", "svelte-ua6zjf");
    			add_location(body_1, file$3, 62, 4, 1620);
    			add_location(main, file$3, 61, 0, 1609);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, body_1);
    			append_dev(body_1, h1);
    			append_dev(body_1, t1);
    			append_dev(body_1, form);
    			append_dev(form, label0);
    			append_dev(form, t3);
    			append_dev(form, input0);
    			set_input_value(input0, /*title*/ ctx[0]);
    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(form, t6);
    			append_dev(form, input1);
    			set_input_value(input1, /*meeting*/ ctx[1]);
    			append_dev(form, t7);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(label2, t8);
    			append_dev(label2, div0);
    			append_dev(label2, t10);
    			append_dev(label2, div1);
    			append_dev(div1, t11);
    			append_dev(div1, br0);
    			append_dev(div1, br1);
    			append_dev(div1, t12);
    			append_dev(div1, br2);
    			append_dev(div1, br3);
    			append_dev(div1, t13);
    			append_dev(div2, t14);
    			append_dev(div2, textarea);
    			set_input_value(textarea, /*body*/ ctx[2]);
    			append_dev(form, t15);
    			append_dev(form, div4);
    			append_dev(div4, h20);
    			append_dev(div4, t17);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div3, null);
    				}
    			}

    			append_dev(div4, t18);
    			append_dev(div4, button0);
    			append_dev(form, t20);
    			append_dev(form, label3);
    			append_dev(form, t22);
    			append_dev(form, input2);
    			set_input_value(input2, /*signMessage*/ ctx[3]);
    			append_dev(form, t23);
    			append_dev(form, div6);
    			append_dev(div6, h21);
    			append_dev(div6, t25);
    			append_dev(div6, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div5, null);
    				}
    			}

    			append_dev(div6, t26);
    			append_dev(div6, button1);
    			append_dev(body_1, t28);
    			append_dev(body_1, button2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[14]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[15]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[16]),
    					listen_dev(button0, "click", /*addClause*/ ctx[7], false, false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[20]),
    					listen_dev(button1, "click", /*addAuthor*/ ctx[10], false, false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[24], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*title*/ 1 && input0.value !== /*title*/ ctx[0]) {
    				set_input_value(input0, /*title*/ ctx[0]);
    			}

    			if (dirty[0] & /*meeting*/ 2 && input1.value !== /*meeting*/ ctx[1]) {
    				set_input_value(input1, /*meeting*/ ctx[1]);
    			}

    			if (dirty[0] & /*body*/ 4) {
    				set_input_value(textarea, /*body*/ ctx[2]);
    			}

    			if (dirty[0] & /*$clauses, removeClause*/ 288) {
    				each_value_1 = /*$clauses*/ ctx[5];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div3, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    				check_outros();
    			}

    			if (dirty[0] & /*signMessage*/ 8 && input2.value !== /*signMessage*/ ctx[3]) {
    				set_input_value(input2, /*signMessage*/ ctx[3]);
    			}

    			if (dirty[0] & /*$authors, removeAuthor*/ 2064) {
    				each_value = /*$authors*/ ctx[4];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div5, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $authors;
    	let $clauses;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MotionForm', slots, []);
    	let title = "";
    	let meeting = "";
    	let body = "";
    	let signMessage = "";

    	const clauseTemplate = {
    		uuid: null,
    		clauseText: "",
    		descriptionText: ""
    	};

    	const clauses = writable([
    		Object.assign(Object.assign({}, clauseTemplate), { uuid: crypto.randomUUID() })
    	]);

    	validate_store(clauses, 'clauses');
    	component_subscribe($$self, clauses, value => $$invalidate(5, $clauses = value));

    	function numberOfClauses() {
    		return $clauses.length;
    	}

    	function addClause() {
    		set_store_value(
    			clauses,
    			$clauses = [
    				...$clauses,
    				Object.assign(Object.assign({}, clauseTemplate), { uuid: crypto.randomUUID() })
    			],
    			$clauses
    		);
    	}

    	function removeClause(uuid) {
    		set_store_value(clauses, $clauses = $clauses.filter(clause => clause.uuid !== uuid), $clauses);
    	}

    	const authorTemplate = { uuid: null, name: "", position: "" };

    	const authors = writable([
    		Object.assign(Object.assign({}, authorTemplate), { uuid: crypto.randomUUID() })
    	]);

    	validate_store(authors, 'authors');
    	component_subscribe($$self, authors, value => $$invalidate(4, $authors = value));

    	function numberOfAuthors() {
    		return $authors.length;
    	}

    	function addAuthor() {
    		set_store_value(
    			authors,
    			$authors = [
    				...$authors,
    				Object.assign(Object.assign({}, authorTemplate), { uuid: crypto.randomUUID() })
    			],
    			$authors
    		);
    	}

    	function removeAuthor(uuid) {
    		set_store_value(authors, $authors = $authors.filter(author => author.uuid !== uuid), $authors);
    	}

    	function getFormData() {
    		return {
    			title,
    			meeting,
    			body,
    			clauses: $clauses,
    			signMessage,
    			authors: $authors
    		};
    	}

    	function generateDocument() {
    		const formData = getFormData();
    		console.log(JSON.stringify(formData));
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<MotionForm> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		title = this.value;
    		$$invalidate(0, title);
    	}

    	function input1_input_handler() {
    		meeting = this.value;
    		$$invalidate(1, meeting);
    	}

    	function textarea_input_handler() {
    		body = this.value;
    		$$invalidate(2, body);
    	}

    	function clause_clauseText_binding(value, clause) {
    		if ($$self.$$.not_equal(clause.clauseText, value)) {
    			clause.clauseText = value;
    			clauses.set($clauses);
    		}
    	}

    	function clause_descriptionText_binding(value, clause) {
    		if ($$self.$$.not_equal(clause.descriptionText, value)) {
    			clause.descriptionText = value;
    			clauses.set($clauses);
    		}
    	}

    	const click_handler = clause => removeClause(clause.uuid);

    	function input2_input_handler() {
    		signMessage = this.value;
    		$$invalidate(3, signMessage);
    	}

    	function author_name_binding(value, author) {
    		if ($$self.$$.not_equal(author.name, value)) {
    			author.name = value;
    			authors.set($authors);
    		}
    	}

    	function author_position_binding(value, author) {
    		if ($$self.$$.not_equal(author.position, value)) {
    			author.position = value;
    			authors.set($authors);
    		}
    	}

    	const click_handler_1 = author => removeAuthor(author.uuid);
    	const click_handler_2 = () => generateDocument();

    	$$self.$capture_state = () => ({
    		Author,
    		Clause,
    		writable,
    		title,
    		meeting,
    		body,
    		signMessage,
    		clauseTemplate,
    		clauses,
    		numberOfClauses,
    		addClause,
    		removeClause,
    		authorTemplate,
    		authors,
    		numberOfAuthors,
    		addAuthor,
    		removeAuthor,
    		getFormData,
    		generateDocument,
    		$authors,
    		$clauses
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('meeting' in $$props) $$invalidate(1, meeting = $$props.meeting);
    		if ('body' in $$props) $$invalidate(2, body = $$props.body);
    		if ('signMessage' in $$props) $$invalidate(3, signMessage = $$props.signMessage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		meeting,
    		body,
    		signMessage,
    		$authors,
    		$clauses,
    		clauses,
    		addClause,
    		removeClause,
    		authors,
    		addAuthor,
    		removeAuthor,
    		generateDocument,
    		getFormData,
    		input0_input_handler,
    		input1_input_handler,
    		textarea_input_handler,
    		clause_clauseText_binding,
    		clause_descriptionText_binding,
    		click_handler,
    		input2_input_handler,
    		author_name_binding,
    		author_position_binding,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class MotionForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { getFormData: 13 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MotionForm",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get getFormData() {
    		return this.$$.ctx[13];
    	}

    	set getFormData(value) {
    		throw new Error("<MotionForm>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/PropositionForm.svelte generated by Svelte v3.59.1 */

    const file$2 = "src/PropositionForm.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let body;
    	let h1;
    	let t1;
    	let form;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let label2;
    	let t8;
    	let div0;
    	let t10;
    	let div1;
    	let t11;
    	let br0;
    	let br1;
    	let t12;
    	let br2;
    	let br3;
    	let t13;
    	let t14;
    	let textarea;
    	let t15;
    	let div6;
    	let label3;
    	let t16;
    	let div4;
    	let div3;
    	let t18;
    	let br4;
    	let br5;
    	let t19;
    	let br6;
    	let br7;
    	let t20;
    	let t21;
    	let div5;
    	let label4;
    	let t23;
    	let input2;
    	let t24;
    	let input3;
    	let t25;
    	let button0;
    	let t27;
    	let label5;
    	let t29;
    	let input4;
    	let t30;
    	let div10;
    	let label6;
    	let t31;
    	let div7;
    	let t33;
    	let div8;
    	let t34;
    	let br8;
    	let br9;
    	let t35;
    	let t36;
    	let div9;
    	let label7;
    	let t38;
    	let input5;
    	let t39;
    	let input6;
    	let t40;
    	let button1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			body = element("body");
    			h1 = element("h1");
    			h1.textContent = "Proposition";
    			t1 = space();
    			form = element("form");
    			label0 = element("label");
    			label0.textContent = "Titel:";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			label1.textContent = "Möte:";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			label2 = element("label");
    			t8 = text("Brödtext:\n                    ");
    			div0 = element("div");
    			div0.textContent = "?";
    			t10 = space();
    			div1 = element("div");
    			t11 = text("Brödtexten är den inledande texten i\n                        motionen/propositionen.\n                        ");
    			br0 = element("br");
    			br1 = element("br");
    			t12 = text("\n                        Syftet med brödtexten är att förklara bakgrunden till att-satserna,\n                        samt att motivera dem.\n                        ");
    			br2 = element("br");
    			br3 = element("br");
    			t13 = text("\n                        Pro tip! Här kan du skriva ren LaTeX-kod om du vill!");
    			t14 = space();
    			textarea = element("textarea");
    			t15 = space();
    			div6 = element("div");
    			label3 = element("label");
    			t16 = text("Att-satser:\n                    ");
    			div4 = element("div");
    			div3 = element("div");
    			div3.textContent = "?";
    			t18 = text("\n                        Förändringar du tycker sektionen ska genomföra skrivs i form\n                        av att-satser. Ett exempel kan vara \"Att sektionen ska sjunga\n                        mer på ...\".\n                        ");
    			br4 = element("br");
    			br5 = element("br");
    			t19 = text("\n                        Observera att du inte behöver skriva \"att\" i början av din\n                        att-sats, detta läggs till automatiskt.\n                        ");
    			br6 = element("br");
    			br7 = element("br");
    			t20 = text("\n                        Om du vill kan du även lägga till en beskrivning av din att-sats.\n                        Ofta är det dock onödigt, eftersom att-satsen i sig bör vara\n                        tillräckligt tydlig, samt att den bör förklaras i brödtexten.");
    			t21 = space();
    			div5 = element("div");
    			label4 = element("label");
    			label4.textContent = "1";
    			t23 = space();
    			input2 = element("input");
    			t24 = space();
    			input3 = element("input");
    			t25 = space();
    			button0 = element("button");
    			button0.textContent = "Lägg till att-sats";
    			t27 = space();
    			label5 = element("label");
    			label5.textContent = "Signaturmeddelande:";
    			t29 = space();
    			input4 = element("input");
    			t30 = space();
    			div10 = element("div");
    			label6 = element("label");
    			t31 = text("Författare:\n                    ");
    			div7 = element("div");
    			div7.textContent = "?";
    			t33 = space();
    			div8 = element("div");
    			t34 = text("Vilka är det som skrivit motionen/propositionen? Lägg\n                        till det här!\n                        ");
    			br8 = element("br");
    			br9 = element("br");
    			t35 = text("\n                        Ibland vill man påtrycka att en motion/proposition är skriven\n                        av någon som innehar en viss post. Detta är inget måste,\n                        utan du kan lämna det blankt eller skriva t.ex. \"Sektionsmedlem\"\n                        också.");
    			t36 = space();
    			div9 = element("div");
    			label7 = element("label");
    			label7.textContent = "1";
    			t38 = space();
    			input5 = element("input");
    			t39 = space();
    			input6 = element("input");
    			t40 = space();
    			button1 = element("button");
    			button1.textContent = "Lägg till författare";
    			add_location(h1, file$2, 4, 8, 55);
    			attr_dev(label0, "for", "title");
    			attr_dev(label0, "class", "svelte-1ojnoj9");
    			add_location(label0, file$2, 6, 12, 121);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "title");
    			attr_dev(input0, "id", "title");
    			attr_dev(input0, "placeholder", "Titel");
    			attr_dev(input0, "class", "svelte-1ojnoj9");
    			add_location(input0, file$2, 7, 12, 167);
    			attr_dev(label1, "for", "meeting");
    			attr_dev(label1, "class", "svelte-1ojnoj9");
    			add_location(label1, file$2, 8, 12, 245);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "meeting");
    			attr_dev(input1, "id", "meeting");
    			attr_dev(input1, "placeholder", "t.ex. VTM, S05");
    			attr_dev(input1, "class", "svelte-1ojnoj9");
    			add_location(input1, file$2, 9, 12, 292);
    			attr_dev(div0, "class", "info-circle svelte-1ojnoj9");
    			add_location(div0, file$2, 18, 20, 584);
    			add_location(br0, file$2, 22, 24, 796);
    			add_location(br1, file$2, 22, 30, 802);
    			add_location(br2, file$2, 25, 24, 972);
    			add_location(br3, file$2, 25, 30, 978);
    			attr_dev(div1, "class", "explanation svelte-1ojnoj9");
    			add_location(div1, file$2, 19, 20, 637);
    			attr_dev(label2, "for", "body");
    			attr_dev(label2, "id", "bodyLabel");
    			attr_dev(label2, "class", "svelte-1ojnoj9");
    			add_location(label2, file$2, 16, 16, 500);
    			attr_dev(textarea, "name", "body");
    			attr_dev(textarea, "id", "body");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			attr_dev(textarea, "placeholder", "Jag tycker att det sjungs för lite på...");
    			attr_dev(textarea, "class", "svelte-1ojnoj9");
    			add_location(textarea, file$2, 29, 16, 1130);
    			attr_dev(div2, "id", "bodyContainer");
    			attr_dev(div2, "class", "svelte-1ojnoj9");
    			add_location(div2, file$2, 15, 12, 459);
    			attr_dev(div3, "class", "info-circle svelte-1ojnoj9");
    			add_location(div3, file$2, 42, 24, 1542);
    			add_location(br4, file$2, 46, 24, 1807);
    			add_location(br5, file$2, 46, 30, 1813);
    			add_location(br6, file$2, 49, 24, 1991);
    			add_location(br7, file$2, 49, 30, 1997);
    			attr_dev(div4, "class", "explanation svelte-1ojnoj9");
    			add_location(div4, file$2, 41, 20, 1492);
    			attr_dev(label3, "class", "svelte-1ojnoj9");
    			add_location(label3, file$2, 39, 16, 1432);
    			attr_dev(label4, "for", "clause1");
    			attr_dev(label4, "class", "svelte-1ojnoj9");
    			add_location(label4, file$2, 56, 20, 2380);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "clause");
    			attr_dev(input2, "id", "clause1");
    			attr_dev(input2, "placeholder", "Att-sats");
    			attr_dev(input2, "class", "svelte-1ojnoj9");
    			add_location(input2, file$2, 57, 20, 2431);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "description");
    			attr_dev(input3, "id", "description1");
    			attr_dev(input3, "placeholder", "Beskrivning (frivillig)");
    			attr_dev(input3, "class", "svelte-1ojnoj9");
    			add_location(input3, file$2, 63, 20, 2639);
    			attr_dev(div5, "class", "clauseFields");
    			add_location(div5, file$2, 55, 16, 2333);
    			attr_dev(div6, "id", "clausesContainer");
    			attr_dev(div6, "class", "svelte-1ojnoj9");
    			add_location(div6, file$2, 38, 12, 1388);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "id", "addClauseButton");
    			attr_dev(button0, "class", "svelte-1ojnoj9");
    			add_location(button0, file$2, 71, 12, 2906);
    			attr_dev(label5, "for", "signMessage");
    			attr_dev(label5, "class", "svelte-1ojnoj9");
    			add_location(label5, file$2, 75, 12, 3020);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "name", "signMessage");
    			attr_dev(input4, "id", "signMessage");
    			attr_dev(input4, "placeholder", "För D-sektionen,");
    			attr_dev(input4, "class", "svelte-1ojnoj9");
    			add_location(input4, file$2, 76, 12, 3085);
    			attr_dev(div7, "class", "info-circle svelte-1ojnoj9");
    			add_location(div7, file$2, 86, 20, 3367);
    			add_location(br8, file$2, 90, 24, 3586);
    			add_location(br9, file$2, 90, 30, 3592);
    			attr_dev(div8, "class", "explanation svelte-1ojnoj9");
    			add_location(div8, file$2, 87, 20, 3420);
    			attr_dev(label6, "class", "svelte-1ojnoj9");
    			add_location(label6, file$2, 84, 16, 3307);
    			attr_dev(label7, "for", "author1");
    			attr_dev(label7, "class", "svelte-1ojnoj9");
    			add_location(label7, file$2, 98, 20, 4001);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "name", "name");
    			attr_dev(input5, "id", "name1");
    			attr_dev(input5, "placeholder", "Namn");
    			attr_dev(input5, "class", "svelte-1ojnoj9");
    			add_location(input5, file$2, 99, 20, 4052);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "name", "position");
    			attr_dev(input6, "id", "position1");
    			attr_dev(input6, "placeholder", "Post (frivillig)");
    			attr_dev(input6, "class", "svelte-1ojnoj9");
    			add_location(input6, file$2, 105, 20, 4252);
    			attr_dev(div9, "class", "authorFields");
    			add_location(div9, file$2, 97, 16, 3954);
    			attr_dev(div10, "id", "authorsContainer");
    			attr_dev(div10, "class", "svelte-1ojnoj9");
    			add_location(div10, file$2, 83, 12, 3263);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "id", "addAuthorButton");
    			attr_dev(button1, "class", "svelte-1ojnoj9");
    			add_location(button1, file$2, 113, 12, 4506);
    			attr_dev(form, "id", "documentform");
    			attr_dev(form, "class", "svelte-1ojnoj9");
    			add_location(form, file$2, 5, 8, 84);
    			attr_dev(body, "class", "svelte-1ojnoj9");
    			add_location(body, file$2, 3, 4, 40);
    			add_location(main, file$2, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, body);
    			append_dev(body, h1);
    			append_dev(body, t1);
    			append_dev(body, form);
    			append_dev(form, label0);
    			append_dev(form, t3);
    			append_dev(form, input0);
    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(form, t6);
    			append_dev(form, input1);
    			append_dev(form, t7);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(label2, t8);
    			append_dev(label2, div0);
    			append_dev(label2, t10);
    			append_dev(label2, div1);
    			append_dev(div1, t11);
    			append_dev(div1, br0);
    			append_dev(div1, br1);
    			append_dev(div1, t12);
    			append_dev(div1, br2);
    			append_dev(div1, br3);
    			append_dev(div1, t13);
    			append_dev(div2, t14);
    			append_dev(div2, textarea);
    			append_dev(form, t15);
    			append_dev(form, div6);
    			append_dev(div6, label3);
    			append_dev(label3, t16);
    			append_dev(label3, div4);
    			append_dev(div4, div3);
    			append_dev(div4, t18);
    			append_dev(div4, br4);
    			append_dev(div4, br5);
    			append_dev(div4, t19);
    			append_dev(div4, br6);
    			append_dev(div4, br7);
    			append_dev(div4, t20);
    			append_dev(div6, t21);
    			append_dev(div6, div5);
    			append_dev(div5, label4);
    			append_dev(div5, t23);
    			append_dev(div5, input2);
    			append_dev(div5, t24);
    			append_dev(div5, input3);
    			append_dev(form, t25);
    			append_dev(form, button0);
    			append_dev(form, t27);
    			append_dev(form, label5);
    			append_dev(form, t29);
    			append_dev(form, input4);
    			append_dev(form, t30);
    			append_dev(form, div10);
    			append_dev(div10, label6);
    			append_dev(label6, t31);
    			append_dev(label6, div7);
    			append_dev(label6, t33);
    			append_dev(label6, div8);
    			append_dev(div8, t34);
    			append_dev(div8, br8);
    			append_dev(div8, br9);
    			append_dev(div8, t35);
    			append_dev(div10, t36);
    			append_dev(div10, div9);
    			append_dev(div9, label7);
    			append_dev(div9, t38);
    			append_dev(div9, input5);
    			append_dev(div9, t39);
    			append_dev(div9, input6);
    			append_dev(form, t40);
    			append_dev(form, button1);
    		},
    		p: noop$1,
    		i: noop$1,
    		o: noop$1,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PropositionForm', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PropositionForm> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class PropositionForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PropositionForm",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/FormSelector.svelte generated by Svelte v3.59.1 */

    const { console: console_1 } = globals;
    const file$1 = "src/FormSelector.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (15:4) {#each forms as form, i}
    function create_each_block(ctx) {
    	let button;
    	let t_value = /*form*/ ctx[3].label + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[2](/*form*/ ctx[3]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			toggle_class(button, "selected", /*activeForm*/ ctx[0] === /*form*/ ctx[3].id);
    			add_location(button, file$1, 15, 8, 502);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*activeForm, forms*/ 3) {
    				toggle_class(button, "selected", /*activeForm*/ ctx[0] === /*form*/ ctx[3].id);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(15:4) {#each forms as form, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h2;
    	let t1;
    	let div0;
    	let t2;
    	let div1;
    	let motionform;
    	let div1_class_value;
    	let t3;
    	let div2;
    	let propositionform;
    	let div2_class_value;
    	let t4;
    	let div3;
    	let handlingform;
    	let div3_class_value;
    	let current;
    	let each_value = /*forms*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	motionform = new MotionForm({ $$inline: true });
    	propositionform = new PropositionForm({ $$inline: true });
    	handlingform = new HandlingForm({ $$inline: true });

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Jag vill skapa en ...";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			create_component(motionform.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			create_component(propositionform.$$.fragment);
    			t4 = space();
    			div3 = element("div");
    			create_component(handlingform.$$.fragment);
    			add_location(h2, file$1, 11, 0, 406);
    			attr_dev(div0, "class", "button-group svelte-rvd78s");
    			add_location(div0, file$1, 13, 0, 438);
    			attr_dev(div1, "class", div1_class_value = "form-container " + [/*activeForm*/ ctx[0] === 1 ? 'active' : 'hidden'] + " svelte-rvd78s");
    			add_location(div1, file$1, 25, 0, 737);
    			attr_dev(div2, "class", div2_class_value = "form-container " + [/*activeForm*/ ctx[0] === 2 ? 'active' : 'hidden'] + " svelte-rvd78s");
    			add_location(div2, file$1, 28, 0, 835);
    			attr_dev(div3, "class", div3_class_value = "form-container " + [/*activeForm*/ ctx[0] === 3 ? 'active' : 'hidden'] + " svelte-rvd78s");
    			add_location(div3, file$1, 31, 0, 938);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(motionform, div1, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(propositionform, div2, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(handlingform, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*activeForm, forms, console*/ 3) {
    				each_value = /*forms*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*activeForm*/ 1 && div1_class_value !== (div1_class_value = "form-container " + [/*activeForm*/ ctx[0] === 1 ? 'active' : 'hidden'] + " svelte-rvd78s")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*activeForm*/ 1 && div2_class_value !== (div2_class_value = "form-container " + [/*activeForm*/ ctx[0] === 2 ? 'active' : 'hidden'] + " svelte-rvd78s")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*activeForm*/ 1 && div3_class_value !== (div3_class_value = "form-container " + [/*activeForm*/ ctx[0] === 3 ? 'active' : 'hidden'] + " svelte-rvd78s")) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(motionform.$$.fragment, local);
    			transition_in(propositionform.$$.fragment, local);
    			transition_in(handlingform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(motionform.$$.fragment, local);
    			transition_out(propositionform.$$.fragment, local);
    			transition_out(handlingform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			destroy_component(motionform);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			destroy_component(propositionform);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    			destroy_component(handlingform);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FormSelector', slots, []);

    	const forms = [
    		{
    			id: 1,
    			label: "Motion",
    			component: MotionForm
    		},
    		{
    			id: 2,
    			label: "Proposition",
    			component: PropositionForm
    		},
    		{
    			id: 3,
    			label: "Handling",
    			component: HandlingForm
    		}
    	];

    	let { activeForm = 1 } = $$props;
    	const writable_props = ['activeForm'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<FormSelector> was created with unknown prop '${key}'`);
    	});

    	const click_handler = form => {
    		$$invalidate(0, activeForm = form.id);
    		console.log(activeForm);
    	};

    	$$self.$$set = $$props => {
    		if ('activeForm' in $$props) $$invalidate(0, activeForm = $$props.activeForm);
    	};

    	$$self.$capture_state = () => ({
    		HandlingForm,
    		MotionForm,
    		PropositionForm,
    		forms,
    		activeForm
    	});

    	$$self.$inject_state = $$props => {
    		if ('activeForm' in $$props) $$invalidate(0, activeForm = $$props.activeForm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeForm, forms, click_handler];
    }

    class FormSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { activeForm: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FormSelector",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get activeForm() {
    		throw new Error("<FormSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeForm(value) {
    		throw new Error("<FormSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.1 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div1;
    	let div0;
    	let h1;
    	let t0;
    	let span;
    	let t2;
    	let t3;
    	let p0;
    	let t5;
    	let p1;
    	let t6;
    	let a0;
    	let t8;
    	let t9;
    	let hr;
    	let t10;
    	let formselector;
    	let t11;
    	let footer;
    	let p2;
    	let t13;
    	let p3;
    	let t14;
    	let a1;
    	let t16;
    	let t17;
    	let p4;
    	let current;
    	formselector = new FormSelector({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text("Ger");
    			span = element("span");
    			span.textContent = "d";
    			t2 = text("a");
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "aka löpbanDet 2.0";
    			t5 = space();
    			p1 = element("p");
    			t6 = text("Detta är ett verktyg för att skapa motioner och propositioner till\n\t\t\tD-sektionens möten. Funktionaliteten är i nuläget något begränsad,\n\t\t\tså bidra gärna med din kunskap på ");
    			a0 = element("a");
    			a0.textContent = "GitHub";
    			t8 = text(".");
    			t9 = space();
    			hr = element("hr");
    			t10 = space();
    			create_component(formselector.$$.fragment);
    			t11 = space();
    			footer = element("footer");
    			p2 = element("p");
    			p2.textContent = "Skapad av: Alfred Grip och Ludvig Svedberg";
    			t13 = space();
    			p3 = element("p");
    			t14 = text("Tycker du det här verktyget är för simpelt? Saknas det något du\n\t\t\tbehöver? Testa skapa dokument med ");
    			a1 = element("a");
    			a1.textContent = "D-sektionens LaTeX-mallar";
    			t16 = text(" på egen hand!");
    			t17 = space();
    			p4 = element("p");
    			attr_dev(span, "id", "site-title-main");
    			set_style(span, "margin-left", "2px");
    			set_style(span, "margin-right", "-10px");
    			attr_dev(span, "class", "svelte-1ea4p8b");
    			add_location(span, file, 10, 7, 235);
    			add_location(h1, file, 9, 3, 223);
    			attr_dev(p0, "id", "site-title-complement");
    			attr_dev(p0, "class", "svelte-1ea4p8b");
    			add_location(p0, file, 15, 3, 347);
    			attr_dev(div0, "id", "site-title-container");
    			attr_dev(div0, "class", "svelte-1ea4p8b");
    			add_location(div0, file, 8, 2, 188);
    			attr_dev(a0, "href", "https://github.com/alfredgrip/gerDa");
    			add_location(a0, file, 20, 37, 591);
    			add_location(p1, file, 17, 2, 410);
    			attr_dev(div1, "id", "outer-container");
    			attr_dev(div1, "class", "svelte-1ea4p8b");
    			add_location(div1, file, 7, 1, 159);
    			add_location(hr, file, 25, 1, 673);
    			add_location(p2, file, 28, 2, 722);
    			attr_dev(a1, "href", "https://github.com/Dsek-LTH/dsek-latex");
    			add_location(a1, file, 31, 37, 882);
    			add_location(p3, file, 29, 2, 774);
    			add_location(p4, file, 36, 2, 997);
    			attr_dev(footer, "id", "footer");
    			add_location(footer, file, 27, 1, 699);
    			attr_dev(main, "class", "svelte-1ea4p8b");
    			add_location(main, file, 6, 0, 151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(h1, span);
    			append_dev(h1, t2);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, t6);
    			append_dev(p1, a0);
    			append_dev(p1, t8);
    			append_dev(main, t9);
    			append_dev(main, hr);
    			append_dev(main, t10);
    			mount_component(formselector, main, null);
    			append_dev(main, t11);
    			append_dev(main, footer);
    			append_dev(footer, p2);
    			append_dev(footer, t13);
    			append_dev(footer, p3);
    			append_dev(p3, t14);
    			append_dev(p3, a1);
    			append_dev(p3, t16);
    			append_dev(footer, t17);
    			append_dev(footer, p4);
    			current = true;
    		},
    		p: noop$1,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(formselector.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(formselector.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(formselector);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function generateDocument() {
    	
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ FormSelector, onMount, generateDocument });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    function bind(fn, thisArg) {
      return function wrap() {
        return fn.apply(thisArg, arguments);
      };
    }

    // utils is a library of generic helper functions non-specific to axios

    const {toString} = Object.prototype;
    const {getPrototypeOf} = Object;

    const kindOf = (cache => thing => {
        const str = toString.call(thing);
        return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
    })(Object.create(null));

    const kindOfTest = (type) => {
      type = type.toLowerCase();
      return (thing) => kindOf(thing) === type
    };

    const typeOfTest = type => thing => typeof thing === type;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     *
     * @returns {boolean} True if value is an Array, otherwise false
     */
    const {isArray} = Array;

    /**
     * Determine if a value is undefined
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    const isUndefined = typeOfTest('undefined');

    /**
     * Determine if a value is a Buffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    const isArrayBuffer = kindOfTest('ArrayBuffer');


    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      let result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a String, otherwise false
     */
    const isString = typeOfTest('string');

    /**
     * Determine if a value is a Function
     *
     * @param {*} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    const isFunction = typeOfTest('function');

    /**
     * Determine if a value is a Number
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Number, otherwise false
     */
    const isNumber = typeOfTest('number');

    /**
     * Determine if a value is an Object
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an Object, otherwise false
     */
    const isObject = (thing) => thing !== null && typeof thing === 'object';

    /**
     * Determine if a value is a Boolean
     *
     * @param {*} thing The value to test
     * @returns {boolean} True if value is a Boolean, otherwise false
     */
    const isBoolean = thing => thing === true || thing === false;

    /**
     * Determine if a value is a plain Object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a plain Object, otherwise false
     */
    const isPlainObject = (val) => {
      if (kindOf(val) !== 'object') {
        return false;
      }

      const prototype = getPrototypeOf(val);
      return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
    };

    /**
     * Determine if a value is a Date
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Date, otherwise false
     */
    const isDate = kindOfTest('Date');

    /**
     * Determine if a value is a File
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFile = kindOfTest('File');

    /**
     * Determine if a value is a Blob
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    const isBlob = kindOfTest('Blob');

    /**
     * Determine if a value is a FileList
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a File, otherwise false
     */
    const isFileList = kindOfTest('FileList');

    /**
     * Determine if a value is a Stream
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    const isStream = (val) => isObject(val) && isFunction(val.pipe);

    /**
     * Determine if a value is a FormData
     *
     * @param {*} thing The value to test
     *
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    const isFormData = (thing) => {
      let kind;
      return thing && (
        (typeof FormData === 'function' && thing instanceof FormData) || (
          isFunction(thing.append) && (
            (kind = kindOf(thing)) === 'formdata' ||
            // detect form-data instance
            (kind === 'object' && isFunction(thing.toString) && thing.toString() === '[object FormData]')
          )
        )
      )
    };

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    const isURLSearchParams = kindOfTest('URLSearchParams');

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     *
     * @returns {String} The String freed of excess whitespace
     */
    const trim = (str) => str.trim ?
      str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     *
     * @param {Boolean} [allOwnKeys = false]
     * @returns {any}
     */
    function forEach(obj, fn, {allOwnKeys = false} = {}) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      let i;
      let l;

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
        const len = keys.length;
        let key;

        for (i = 0; i < len; i++) {
          key = keys[i];
          fn.call(null, obj[key], key, obj);
        }
      }
    }

    function findKey(obj, key) {
      key = key.toLowerCase();
      const keys = Object.keys(obj);
      let i = keys.length;
      let _key;
      while (i-- > 0) {
        _key = keys[i];
        if (key === _key.toLowerCase()) {
          return _key;
        }
      }
      return null;
    }

    const _global = (() => {
      /*eslint no-undef:0*/
      if (typeof globalThis !== "undefined") return globalThis;
      return typeof self !== "undefined" ? self : (typeof window !== 'undefined' ? window : global)
    })();

    const isContextDefined = (context) => !isUndefined(context) && context !== _global;

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     *
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      const {caseless} = isContextDefined(this) && this || {};
      const result = {};
      const assignValue = (val, key) => {
        const targetKey = caseless && findKey(result, key) || key;
        if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
          result[targetKey] = merge(result[targetKey], val);
        } else if (isPlainObject(val)) {
          result[targetKey] = merge({}, val);
        } else if (isArray(val)) {
          result[targetKey] = val.slice();
        } else {
          result[targetKey] = val;
        }
      };

      for (let i = 0, l = arguments.length; i < l; i++) {
        arguments[i] && forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     *
     * @param {Boolean} [allOwnKeys]
     * @returns {Object} The resulting value of object a
     */
    const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
      forEach(b, (val, key) => {
        if (thisArg && isFunction(val)) {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      }, {allOwnKeys});
      return a;
    };

    /**
     * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
     *
     * @param {string} content with BOM
     *
     * @returns {string} content value without BOM
     */
    const stripBOM = (content) => {
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      return content;
    };

    /**
     * Inherit the prototype methods from one constructor into another
     * @param {function} constructor
     * @param {function} superConstructor
     * @param {object} [props]
     * @param {object} [descriptors]
     *
     * @returns {void}
     */
    const inherits = (constructor, superConstructor, props, descriptors) => {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      constructor.prototype.constructor = constructor;
      Object.defineProperty(constructor, 'super', {
        value: superConstructor.prototype
      });
      props && Object.assign(constructor.prototype, props);
    };

    /**
     * Resolve object with deep prototype chain to a flat object
     * @param {Object} sourceObj source object
     * @param {Object} [destObj]
     * @param {Function|Boolean} [filter]
     * @param {Function} [propFilter]
     *
     * @returns {Object}
     */
    const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
      let props;
      let i;
      let prop;
      const merged = {};

      destObj = destObj || {};
      // eslint-disable-next-line no-eq-null,eqeqeq
      if (sourceObj == null) return destObj;

      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = filter !== false && getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

      return destObj;
    };

    /**
     * Determines whether a string ends with the characters of a specified string
     *
     * @param {String} str
     * @param {String} searchString
     * @param {Number} [position= 0]
     *
     * @returns {boolean}
     */
    const endsWith = (str, searchString, position) => {
      str = String(str);
      if (position === undefined || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      const lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };


    /**
     * Returns new array from array like object or null if failed
     *
     * @param {*} [thing]
     *
     * @returns {?Array}
     */
    const toArray = (thing) => {
      if (!thing) return null;
      if (isArray(thing)) return thing;
      let i = thing.length;
      if (!isNumber(i)) return null;
      const arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    };

    /**
     * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
     * thing passed in is an instance of Uint8Array
     *
     * @param {TypedArray}
     *
     * @returns {Array}
     */
    // eslint-disable-next-line func-names
    const isTypedArray = (TypedArray => {
      // eslint-disable-next-line func-names
      return thing => {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== 'undefined' && getPrototypeOf(Uint8Array));

    /**
     * For each entry in the object, call the function with the key and value.
     *
     * @param {Object<any, any>} obj - The object to iterate over.
     * @param {Function} fn - The function to call for each entry.
     *
     * @returns {void}
     */
    const forEachEntry = (obj, fn) => {
      const generator = obj && obj[Symbol.iterator];

      const iterator = generator.call(obj);

      let result;

      while ((result = iterator.next()) && !result.done) {
        const pair = result.value;
        fn.call(obj, pair[0], pair[1]);
      }
    };

    /**
     * It takes a regular expression and a string, and returns an array of all the matches
     *
     * @param {string} regExp - The regular expression to match against.
     * @param {string} str - The string to search.
     *
     * @returns {Array<boolean>}
     */
    const matchAll = (regExp, str) => {
      let matches;
      const arr = [];

      while ((matches = regExp.exec(str)) !== null) {
        arr.push(matches);
      }

      return arr;
    };

    /* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
    const isHTMLForm = kindOfTest('HTMLFormElement');

    const toCamelCase = str => {
      return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,
        function replacer(m, p1, p2) {
          return p1.toUpperCase() + p2;
        }
      );
    };

    /* Creating a function that will check if an object has a property. */
    const hasOwnProperty = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);

    /**
     * Determine if a value is a RegExp object
     *
     * @param {*} val The value to test
     *
     * @returns {boolean} True if value is a RegExp object, otherwise false
     */
    const isRegExp = kindOfTest('RegExp');

    const reduceDescriptors = (obj, reducer) => {
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      const reducedDescriptors = {};

      forEach(descriptors, (descriptor, name) => {
        if (reducer(descriptor, name, obj) !== false) {
          reducedDescriptors[name] = descriptor;
        }
      });

      Object.defineProperties(obj, reducedDescriptors);
    };

    /**
     * Makes all methods read-only
     * @param {Object} obj
     */

    const freezeMethods = (obj) => {
      reduceDescriptors(obj, (descriptor, name) => {
        // skip restricted props in strict mode
        if (isFunction(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
          return false;
        }

        const value = obj[name];

        if (!isFunction(value)) return;

        descriptor.enumerable = false;

        if ('writable' in descriptor) {
          descriptor.writable = false;
          return;
        }

        if (!descriptor.set) {
          descriptor.set = () => {
            throw Error('Can not rewrite read-only method \'' + name + '\'');
          };
        }
      });
    };

    const toObjectSet = (arrayOrString, delimiter) => {
      const obj = {};

      const define = (arr) => {
        arr.forEach(value => {
          obj[value] = true;
        });
      };

      isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

      return obj;
    };

    const noop = () => {};

    const toFiniteNumber = (value, defaultValue) => {
      value = +value;
      return Number.isFinite(value) ? value : defaultValue;
    };

    const ALPHA = 'abcdefghijklmnopqrstuvwxyz';

    const DIGIT = '0123456789';

    const ALPHABET = {
      DIGIT,
      ALPHA,
      ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
    };

    const generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
      let str = '';
      const {length} = alphabet;
      while (size--) {
        str += alphabet[Math.random() * length|0];
      }

      return str;
    };

    /**
     * If the thing is a FormData object, return true, otherwise return false.
     *
     * @param {unknown} thing - The thing to check.
     *
     * @returns {boolean}
     */
    function isSpecCompliantForm(thing) {
      return !!(thing && isFunction(thing.append) && thing[Symbol.toStringTag] === 'FormData' && thing[Symbol.iterator]);
    }

    const toJSONObject = (obj) => {
      const stack = new Array(10);

      const visit = (source, i) => {

        if (isObject(source)) {
          if (stack.indexOf(source) >= 0) {
            return;
          }

          if(!('toJSON' in source)) {
            stack[i] = source;
            const target = isArray(source) ? [] : {};

            forEach(source, (value, key) => {
              const reducedValue = visit(value, i + 1);
              !isUndefined(reducedValue) && (target[key] = reducedValue);
            });

            stack[i] = undefined;

            return target;
          }
        }

        return source;
      };

      return visit(obj, 0);
    };

    const isAsyncFn = kindOfTest('AsyncFunction');

    const isThenable = (thing) =>
      thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);

    var utils = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString,
      isNumber,
      isBoolean,
      isObject,
      isPlainObject,
      isUndefined,
      isDate,
      isFile,
      isBlob,
      isRegExp,
      isFunction,
      isStream,
      isURLSearchParams,
      isTypedArray,
      isFileList,
      forEach,
      merge,
      extend,
      trim,
      stripBOM,
      inherits,
      toFlatObject,
      kindOf,
      kindOfTest,
      endsWith,
      toArray,
      forEachEntry,
      matchAll,
      isHTMLForm,
      hasOwnProperty,
      hasOwnProp: hasOwnProperty, // an alias to avoid ESLint no-prototype-builtins detection
      reduceDescriptors,
      freezeMethods,
      toObjectSet,
      toCamelCase,
      noop,
      toFiniteNumber,
      findKey,
      global: _global,
      isContextDefined,
      ALPHABET,
      generateString,
      isSpecCompliantForm,
      toJSONObject,
      isAsyncFn,
      isThenable
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [config] The config.
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     *
     * @returns {Error} The created error.
     */
    function AxiosError(message, code, config, request, response) {
      Error.call(this);

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = (new Error()).stack;
      }

      this.message = message;
      this.name = 'AxiosError';
      code && (this.code = code);
      config && (this.config = config);
      request && (this.request = request);
      response && (this.response = response);
    }

    utils.inherits(AxiosError, Error, {
      toJSON: function toJSON() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: utils.toJSONObject(this.config),
          code: this.code,
          status: this.response && this.response.status ? this.response.status : null
        };
      }
    });

    const prototype$1 = AxiosError.prototype;
    const descriptors = {};

    [
      'ERR_BAD_OPTION_VALUE',
      'ERR_BAD_OPTION',
      'ECONNABORTED',
      'ETIMEDOUT',
      'ERR_NETWORK',
      'ERR_FR_TOO_MANY_REDIRECTS',
      'ERR_DEPRECATED',
      'ERR_BAD_RESPONSE',
      'ERR_BAD_REQUEST',
      'ERR_CANCELED',
      'ERR_NOT_SUPPORT',
      'ERR_INVALID_URL'
    // eslint-disable-next-line func-names
    ].forEach(code => {
      descriptors[code] = {value: code};
    });

    Object.defineProperties(AxiosError, descriptors);
    Object.defineProperty(prototype$1, 'isAxiosError', {value: true});

    // eslint-disable-next-line func-names
    AxiosError.from = (error, code, config, request, response, customProps) => {
      const axiosError = Object.create(prototype$1);

      utils.toFlatObject(error, axiosError, function filter(obj) {
        return obj !== Error.prototype;
      }, prop => {
        return prop !== 'isAxiosError';
      });

      AxiosError.call(axiosError, error.message, code, config, request, response);

      axiosError.cause = error;

      axiosError.name = error.name;

      customProps && Object.assign(axiosError, customProps);

      return axiosError;
    };

    // eslint-disable-next-line strict
    var httpAdapter = null;

    /**
     * Determines if the given thing is a array or js object.
     *
     * @param {string} thing - The object or array to be visited.
     *
     * @returns {boolean}
     */
    function isVisitable(thing) {
      return utils.isPlainObject(thing) || utils.isArray(thing);
    }

    /**
     * It removes the brackets from the end of a string
     *
     * @param {string} key - The key of the parameter.
     *
     * @returns {string} the key without the brackets.
     */
    function removeBrackets(key) {
      return utils.endsWith(key, '[]') ? key.slice(0, -2) : key;
    }

    /**
     * It takes a path, a key, and a boolean, and returns a string
     *
     * @param {string} path - The path to the current key.
     * @param {string} key - The key of the current object being iterated over.
     * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
     *
     * @returns {string} The path to the current key.
     */
    function renderKey(path, key, dots) {
      if (!path) return key;
      return path.concat(key).map(function each(token, i) {
        // eslint-disable-next-line no-param-reassign
        token = removeBrackets(token);
        return !dots && i ? '[' + token + ']' : token;
      }).join(dots ? '.' : '');
    }

    /**
     * If the array is an array and none of its elements are visitable, then it's a flat array.
     *
     * @param {Array<any>} arr - The array to check
     *
     * @returns {boolean}
     */
    function isFlatArray(arr) {
      return utils.isArray(arr) && !arr.some(isVisitable);
    }

    const predicates = utils.toFlatObject(utils, {}, null, function filter(prop) {
      return /^is[A-Z]/.test(prop);
    });

    /**
     * Convert a data object to FormData
     *
     * @param {Object} obj
     * @param {?Object} [formData]
     * @param {?Object} [options]
     * @param {Function} [options.visitor]
     * @param {Boolean} [options.metaTokens = true]
     * @param {Boolean} [options.dots = false]
     * @param {?Boolean} [options.indexes = false]
     *
     * @returns {Object}
     **/

    /**
     * It converts an object into a FormData object
     *
     * @param {Object<any, any>} obj - The object to convert to form data.
     * @param {string} formData - The FormData object to append to.
     * @param {Object<string, any>} options
     *
     * @returns
     */
    function toFormData(obj, formData, options) {
      if (!utils.isObject(obj)) {
        throw new TypeError('target must be an object');
      }

      // eslint-disable-next-line no-param-reassign
      formData = formData || new (FormData)();

      // eslint-disable-next-line no-param-reassign
      options = utils.toFlatObject(options, {
        metaTokens: true,
        dots: false,
        indexes: false
      }, false, function defined(option, source) {
        // eslint-disable-next-line no-eq-null,eqeqeq
        return !utils.isUndefined(source[option]);
      });

      const metaTokens = options.metaTokens;
      // eslint-disable-next-line no-use-before-define
      const visitor = options.visitor || defaultVisitor;
      const dots = options.dots;
      const indexes = options.indexes;
      const _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
      const useBlob = _Blob && utils.isSpecCompliantForm(formData);

      if (!utils.isFunction(visitor)) {
        throw new TypeError('visitor must be a function');
      }

      function convertValue(value) {
        if (value === null) return '';

        if (utils.isDate(value)) {
          return value.toISOString();
        }

        if (!useBlob && utils.isBlob(value)) {
          throw new AxiosError('Blob is not supported. Use a Buffer instead.');
        }

        if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
          return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
        }

        return value;
      }

      /**
       * Default visitor.
       *
       * @param {*} value
       * @param {String|Number} key
       * @param {Array<String|Number>} path
       * @this {FormData}
       *
       * @returns {boolean} return true to visit the each prop of the value recursively
       */
      function defaultVisitor(value, key, path) {
        let arr = value;

        if (value && !path && typeof value === 'object') {
          if (utils.endsWith(key, '{}')) {
            // eslint-disable-next-line no-param-reassign
            key = metaTokens ? key : key.slice(0, -2);
            // eslint-disable-next-line no-param-reassign
            value = JSON.stringify(value);
          } else if (
            (utils.isArray(value) && isFlatArray(value)) ||
            ((utils.isFileList(value) || utils.endsWith(key, '[]')) && (arr = utils.toArray(value))
            )) {
            // eslint-disable-next-line no-param-reassign
            key = removeBrackets(key);

            arr.forEach(function each(el, index) {
              !(utils.isUndefined(el) || el === null) && formData.append(
                // eslint-disable-next-line no-nested-ternary
                indexes === true ? renderKey([key], index, dots) : (indexes === null ? key : key + '[]'),
                convertValue(el)
              );
            });
            return false;
          }
        }

        if (isVisitable(value)) {
          return true;
        }

        formData.append(renderKey(path, key, dots), convertValue(value));

        return false;
      }

      const stack = [];

      const exposedHelpers = Object.assign(predicates, {
        defaultVisitor,
        convertValue,
        isVisitable
      });

      function build(value, path) {
        if (utils.isUndefined(value)) return;

        if (stack.indexOf(value) !== -1) {
          throw Error('Circular reference detected in ' + path.join('.'));
        }

        stack.push(value);

        utils.forEach(value, function each(el, key) {
          const result = !(utils.isUndefined(el) || el === null) && visitor.call(
            formData, el, utils.isString(key) ? key.trim() : key, path, exposedHelpers
          );

          if (result === true) {
            build(el, path ? path.concat(key) : [key]);
          }
        });

        stack.pop();
      }

      if (!utils.isObject(obj)) {
        throw new TypeError('data must be an object');
      }

      build(obj);

      return formData;
    }

    /**
     * It encodes a string by replacing all characters that are not in the unreserved set with
     * their percent-encoded equivalents
     *
     * @param {string} str - The string to encode.
     *
     * @returns {string} The encoded string.
     */
    function encode$1(str) {
      const charMap = {
        '!': '%21',
        "'": '%27',
        '(': '%28',
        ')': '%29',
        '~': '%7E',
        '%20': '+',
        '%00': '\x00'
      };
      return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
        return charMap[match];
      });
    }

    /**
     * It takes a params object and converts it to a FormData object
     *
     * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
     * @param {Object<string, any>} options - The options object passed to the Axios constructor.
     *
     * @returns {void}
     */
    function AxiosURLSearchParams(params, options) {
      this._pairs = [];

      params && toFormData(params, this, options);
    }

    const prototype = AxiosURLSearchParams.prototype;

    prototype.append = function append(name, value) {
      this._pairs.push([name, value]);
    };

    prototype.toString = function toString(encoder) {
      const _encode = encoder ? function(value) {
        return encoder.call(this, value, encode$1);
      } : encode$1;

      return this._pairs.map(function each(pair) {
        return _encode(pair[0]) + '=' + _encode(pair[1]);
      }, '').join('&');
    };

    /**
     * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
     * URI encoded counterparts
     *
     * @param {string} val The value to be encoded.
     *
     * @returns {string} The encoded value.
     */
    function encode(val) {
      return encodeURIComponent(val).
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @param {?object} options
     *
     * @returns {string} The formatted url
     */
    function buildURL(url, params, options) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }
      
      const _encode = options && options.encode || encode;

      const serializeFn = options && options.serialize;

      let serializedParams;

      if (serializeFn) {
        serializedParams = serializeFn(params, options);
      } else {
        serializedParams = utils.isURLSearchParams(params) ?
          params.toString() :
          new AxiosURLSearchParams(params, options).toString(_encode);
      }

      if (serializedParams) {
        const hashmarkIndex = url.indexOf("#");

        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    }

    class InterceptorManager {
      constructor() {
        this.handlers = [];
      }

      /**
       * Add a new interceptor to the stack
       *
       * @param {Function} fulfilled The function to handle `then` for a `Promise`
       * @param {Function} rejected The function to handle `reject` for a `Promise`
       *
       * @return {Number} An ID used to remove interceptor later
       */
      use(fulfilled, rejected, options) {
        this.handlers.push({
          fulfilled,
          rejected,
          synchronous: options ? options.synchronous : false,
          runWhen: options ? options.runWhen : null
        });
        return this.handlers.length - 1;
      }

      /**
       * Remove an interceptor from the stack
       *
       * @param {Number} id The ID that was returned by `use`
       *
       * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
       */
      eject(id) {
        if (this.handlers[id]) {
          this.handlers[id] = null;
        }
      }

      /**
       * Clear all interceptors from the stack
       *
       * @returns {void}
       */
      clear() {
        if (this.handlers) {
          this.handlers = [];
        }
      }

      /**
       * Iterate over all the registered interceptors
       *
       * This method is particularly useful for skipping over any
       * interceptors that may have become `null` calling `eject`.
       *
       * @param {Function} fn The function to call for each interceptor
       *
       * @returns {void}
       */
      forEach(fn) {
        utils.forEach(this.handlers, function forEachHandler(h) {
          if (h !== null) {
            fn(h);
          }
        });
      }
    }

    var InterceptorManager$1 = InterceptorManager;

    var transitionalDefaults = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    };

    var URLSearchParams$1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams;

    var FormData$1 = typeof FormData !== 'undefined' ? FormData : null;

    var Blob$1 = typeof Blob !== 'undefined' ? Blob : null;

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     *
     * @returns {boolean}
     */
    const isStandardBrowserEnv = (() => {
      let product;
      if (typeof navigator !== 'undefined' && (
        (product = navigator.product) === 'ReactNative' ||
        product === 'NativeScript' ||
        product === 'NS')
      ) {
        return false;
      }

      return typeof window !== 'undefined' && typeof document !== 'undefined';
    })();

    /**
     * Determine if we're running in a standard browser webWorker environment
     *
     * Although the `isStandardBrowserEnv` method indicates that
     * `allows axios to run in a web worker`, the WebWorker will still be
     * filtered out due to its judgment standard
     * `typeof window !== 'undefined' && typeof document !== 'undefined'`.
     * This leads to a problem when axios post `FormData` in webWorker
     */
     const isStandardBrowserWebWorkerEnv = (() => {
      return (
        typeof WorkerGlobalScope !== 'undefined' &&
        // eslint-disable-next-line no-undef
        self instanceof WorkerGlobalScope &&
        typeof self.importScripts === 'function'
      );
    })();


    var platform = {
      isBrowser: true,
      classes: {
        URLSearchParams: URLSearchParams$1,
        FormData: FormData$1,
        Blob: Blob$1
      },
      isStandardBrowserEnv,
      isStandardBrowserWebWorkerEnv,
      protocols: ['http', 'https', 'file', 'blob', 'url', 'data']
    };

    function toURLEncodedForm(data, options) {
      return toFormData(data, new platform.classes.URLSearchParams(), Object.assign({
        visitor: function(value, key, path, helpers) {
          if (platform.isNode && utils.isBuffer(value)) {
            this.append(key, value.toString('base64'));
            return false;
          }

          return helpers.defaultVisitor.apply(this, arguments);
        }
      }, options));
    }

    /**
     * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
     *
     * @param {string} name - The name of the property to get.
     *
     * @returns An array of strings.
     */
    function parsePropPath(name) {
      // foo[x][y][z]
      // foo.x.y.z
      // foo-x-y-z
      // foo x y z
      return utils.matchAll(/\w+|\[(\w*)]/g, name).map(match => {
        return match[0] === '[]' ? '' : match[1] || match[0];
      });
    }

    /**
     * Convert an array to an object.
     *
     * @param {Array<any>} arr - The array to convert to an object.
     *
     * @returns An object with the same keys and values as the array.
     */
    function arrayToObject(arr) {
      const obj = {};
      const keys = Object.keys(arr);
      let i;
      const len = keys.length;
      let key;
      for (i = 0; i < len; i++) {
        key = keys[i];
        obj[key] = arr[key];
      }
      return obj;
    }

    /**
     * It takes a FormData object and returns a JavaScript object
     *
     * @param {string} formData The FormData object to convert to JSON.
     *
     * @returns {Object<string, any> | null} The converted object.
     */
    function formDataToJSON(formData) {
      function buildPath(path, value, target, index) {
        let name = path[index++];
        const isNumericKey = Number.isFinite(+name);
        const isLast = index >= path.length;
        name = !name && utils.isArray(target) ? target.length : name;

        if (isLast) {
          if (utils.hasOwnProp(target, name)) {
            target[name] = [target[name], value];
          } else {
            target[name] = value;
          }

          return !isNumericKey;
        }

        if (!target[name] || !utils.isObject(target[name])) {
          target[name] = [];
        }

        const result = buildPath(path, value, target[name], index);

        if (result && utils.isArray(target[name])) {
          target[name] = arrayToObject(target[name]);
        }

        return !isNumericKey;
      }

      if (utils.isFormData(formData) && utils.isFunction(formData.entries)) {
        const obj = {};

        utils.forEachEntry(formData, (name, value) => {
          buildPath(parsePropPath(name), value, obj, 0);
        });

        return obj;
      }

      return null;
    }

    const DEFAULT_CONTENT_TYPE = {
      'Content-Type': undefined
    };

    /**
     * It takes a string, tries to parse it, and if it fails, it returns the stringified version
     * of the input
     *
     * @param {any} rawValue - The value to be stringified.
     * @param {Function} parser - A function that parses a string into a JavaScript object.
     * @param {Function} encoder - A function that takes a value and returns a string.
     *
     * @returns {string} A stringified version of the rawValue.
     */
    function stringifySafely(rawValue, parser, encoder) {
      if (utils.isString(rawValue)) {
        try {
          (parser || JSON.parse)(rawValue);
          return utils.trim(rawValue);
        } catch (e) {
          if (e.name !== 'SyntaxError') {
            throw e;
          }
        }
      }

      return (encoder || JSON.stringify)(rawValue);
    }

    const defaults = {

      transitional: transitionalDefaults,

      adapter: ['xhr', 'http'],

      transformRequest: [function transformRequest(data, headers) {
        const contentType = headers.getContentType() || '';
        const hasJSONContentType = contentType.indexOf('application/json') > -1;
        const isObjectPayload = utils.isObject(data);

        if (isObjectPayload && utils.isHTMLForm(data)) {
          data = new FormData(data);
        }

        const isFormData = utils.isFormData(data);

        if (isFormData) {
          if (!hasJSONContentType) {
            return data;
          }
          return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
        }

        if (utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
          return data.toString();
        }

        let isFileList;

        if (isObjectPayload) {
          if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
            return toURLEncodedForm(data, this.formSerializer).toString();
          }

          if ((isFileList = utils.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
            const _FormData = this.env && this.env.FormData;

            return toFormData(
              isFileList ? {'files[]': data} : data,
              _FormData && new _FormData(),
              this.formSerializer
            );
          }
        }

        if (isObjectPayload || hasJSONContentType ) {
          headers.setContentType('application/json', false);
          return stringifySafely(data);
        }

        return data;
      }],

      transformResponse: [function transformResponse(data) {
        const transitional = this.transitional || defaults.transitional;
        const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
        const JSONRequested = this.responseType === 'json';

        if (data && utils.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
          const silentJSONParsing = transitional && transitional.silentJSONParsing;
          const strictJSONParsing = !silentJSONParsing && JSONRequested;

          try {
            return JSON.parse(data);
          } catch (e) {
            if (strictJSONParsing) {
              if (e.name === 'SyntaxError') {
                throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
              }
              throw e;
            }
          }
        }

        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,
      maxBodyLength: -1,

      env: {
        FormData: platform.classes.FormData,
        Blob: platform.classes.Blob
      },

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },

      headers: {
        common: {
          'Accept': 'application/json, text/plain, */*'
        }
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults$1 = defaults;

    // RawAxiosHeaders whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    const ignoreDuplicateOf = utils.toObjectSet([
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ]);

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} rawHeaders Headers needing to be parsed
     *
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = rawHeaders => {
      const parsed = {};
      let key;
      let val;
      let i;

      rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
        i = line.indexOf(':');
        key = line.substring(0, i).trim().toLowerCase();
        val = line.substring(i + 1).trim();

        if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
          return;
        }

        if (key === 'set-cookie') {
          if (parsed[key]) {
            parsed[key].push(val);
          } else {
            parsed[key] = [val];
          }
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      });

      return parsed;
    };

    const $internals = Symbol('internals');

    function normalizeHeader(header) {
      return header && String(header).trim().toLowerCase();
    }

    function normalizeValue(value) {
      if (value === false || value == null) {
        return value;
      }

      return utils.isArray(value) ? value.map(normalizeValue) : String(value);
    }

    function parseTokens(str) {
      const tokens = Object.create(null);
      const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
      let match;

      while ((match = tokensRE.exec(str))) {
        tokens[match[1]] = match[2];
      }

      return tokens;
    }

    const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

    function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
      if (utils.isFunction(filter)) {
        return filter.call(this, value, header);
      }

      if (isHeaderNameFilter) {
        value = header;
      }

      if (!utils.isString(value)) return;

      if (utils.isString(filter)) {
        return value.indexOf(filter) !== -1;
      }

      if (utils.isRegExp(filter)) {
        return filter.test(value);
      }
    }

    function formatHeader(header) {
      return header.trim()
        .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
          return char.toUpperCase() + str;
        });
    }

    function buildAccessors(obj, header) {
      const accessorName = utils.toCamelCase(' ' + header);

      ['get', 'set', 'has'].forEach(methodName => {
        Object.defineProperty(obj, methodName + accessorName, {
          value: function(arg1, arg2, arg3) {
            return this[methodName].call(this, header, arg1, arg2, arg3);
          },
          configurable: true
        });
      });
    }

    class AxiosHeaders {
      constructor(headers) {
        headers && this.set(headers);
      }

      set(header, valueOrRewrite, rewrite) {
        const self = this;

        function setHeader(_value, _header, _rewrite) {
          const lHeader = normalizeHeader(_header);

          if (!lHeader) {
            throw new Error('header name must be a non-empty string');
          }

          const key = utils.findKey(self, lHeader);

          if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
            self[key || _header] = normalizeValue(_value);
          }
        }

        const setHeaders = (headers, _rewrite) =>
          utils.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

        if (utils.isPlainObject(header) || header instanceof this.constructor) {
          setHeaders(header, valueOrRewrite);
        } else if(utils.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
          setHeaders(parseHeaders(header), valueOrRewrite);
        } else {
          header != null && setHeader(valueOrRewrite, header, rewrite);
        }

        return this;
      }

      get(header, parser) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils.findKey(this, header);

          if (key) {
            const value = this[key];

            if (!parser) {
              return value;
            }

            if (parser === true) {
              return parseTokens(value);
            }

            if (utils.isFunction(parser)) {
              return parser.call(this, value, key);
            }

            if (utils.isRegExp(parser)) {
              return parser.exec(value);
            }

            throw new TypeError('parser must be boolean|regexp|function');
          }
        }
      }

      has(header, matcher) {
        header = normalizeHeader(header);

        if (header) {
          const key = utils.findKey(this, header);

          return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
        }

        return false;
      }

      delete(header, matcher) {
        const self = this;
        let deleted = false;

        function deleteHeader(_header) {
          _header = normalizeHeader(_header);

          if (_header) {
            const key = utils.findKey(self, _header);

            if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
              delete self[key];

              deleted = true;
            }
          }
        }

        if (utils.isArray(header)) {
          header.forEach(deleteHeader);
        } else {
          deleteHeader(header);
        }

        return deleted;
      }

      clear(matcher) {
        const keys = Object.keys(this);
        let i = keys.length;
        let deleted = false;

        while (i--) {
          const key = keys[i];
          if(!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
            delete this[key];
            deleted = true;
          }
        }

        return deleted;
      }

      normalize(format) {
        const self = this;
        const headers = {};

        utils.forEach(this, (value, header) => {
          const key = utils.findKey(headers, header);

          if (key) {
            self[key] = normalizeValue(value);
            delete self[header];
            return;
          }

          const normalized = format ? formatHeader(header) : String(header).trim();

          if (normalized !== header) {
            delete self[header];
          }

          self[normalized] = normalizeValue(value);

          headers[normalized] = true;
        });

        return this;
      }

      concat(...targets) {
        return this.constructor.concat(this, ...targets);
      }

      toJSON(asStrings) {
        const obj = Object.create(null);

        utils.forEach(this, (value, header) => {
          value != null && value !== false && (obj[header] = asStrings && utils.isArray(value) ? value.join(', ') : value);
        });

        return obj;
      }

      [Symbol.iterator]() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }

      toString() {
        return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
      }

      get [Symbol.toStringTag]() {
        return 'AxiosHeaders';
      }

      static from(thing) {
        return thing instanceof this ? thing : new this(thing);
      }

      static concat(first, ...targets) {
        const computed = new this(first);

        targets.forEach((target) => computed.set(target));

        return computed;
      }

      static accessor(header) {
        const internals = this[$internals] = (this[$internals] = {
          accessors: {}
        });

        const accessors = internals.accessors;
        const prototype = this.prototype;

        function defineAccessor(_header) {
          const lHeader = normalizeHeader(_header);

          if (!accessors[lHeader]) {
            buildAccessors(prototype, _header);
            accessors[lHeader] = true;
          }
        }

        utils.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

        return this;
      }
    }

    AxiosHeaders.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);

    utils.freezeMethods(AxiosHeaders.prototype);
    utils.freezeMethods(AxiosHeaders);

    var AxiosHeaders$1 = AxiosHeaders;

    /**
     * Transform the data for a request or a response
     *
     * @param {Array|Function} fns A single function or Array of functions
     * @param {?Object} response The response object
     *
     * @returns {*} The resulting transformed data
     */
    function transformData(fns, response) {
      const config = this || defaults$1;
      const context = response || config;
      const headers = AxiosHeaders$1.from(context.headers);
      let data = context.data;

      utils.forEach(fns, function transform(fn) {
        data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
      });

      headers.normalize();

      return data;
    }

    function isCancel(value) {
      return !!(value && value.__CANCEL__);
    }

    /**
     * A `CanceledError` is an object that is thrown when an operation is canceled.
     *
     * @param {string=} message The message.
     * @param {Object=} config The config.
     * @param {Object=} request The request.
     *
     * @returns {CanceledError} The created error.
     */
    function CanceledError(message, config, request) {
      // eslint-disable-next-line no-eq-null,eqeqeq
      AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED, config, request);
      this.name = 'CanceledError';
    }

    utils.inherits(CanceledError, AxiosError, {
      __CANCEL__: true
    });

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     *
     * @returns {object} The response.
     */
    function settle(resolve, reject, response) {
      const validateStatus = response.config.validateStatus;
      if (!response.status || !validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(new AxiosError(
          'Request failed with status code ' + response.status,
          [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
          response.config,
          response.request,
          response
        ));
      }
    }

    var cookies = platform.isStandardBrowserEnv ?

    // Standard browser envs support document.cookie
      (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            const cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));

            if (utils.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }

            if (utils.isString(path)) {
              cookie.push('path=' + path);
            }

            if (utils.isString(domain)) {
              cookie.push('domain=' + domain);
            }

            if (secure === true) {
              cookie.push('secure');
            }

            document.cookie = cookie.join('; ');
          },

          read: function read(name) {
            const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
            return (match ? decodeURIComponent(match[3]) : null);
          },

          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      })() :

    // Non standard browser env (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() { return null; },
          remove: function remove() {}
        };
      })();

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     *
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
    }

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     *
     * @returns {string} The combined URL
     */
    function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    }

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     *
     * @returns {string} The combined full path
     */
    function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    }

    var isURLSameOrigin = platform.isStandardBrowserEnv ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        const msie = /(msie|trident)/i.test(navigator.userAgent);
        const urlParsingNode = document.createElement('a');
        let originURL;

        /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
        function resolveURL(url) {
          let href = url;

          if (msie) {
            // IE needs attribute set twice to normalize properties
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);

          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
              urlParsingNode.pathname :
              '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);

        /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
        return function isURLSameOrigin(requestURL) {
          const parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
        };
      })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })();

    function parseProtocol(url) {
      const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
      return match && match[1] || '';
    }

    /**
     * Calculate data maxRate
     * @param {Number} [samplesCount= 10]
     * @param {Number} [min= 1000]
     * @returns {Function}
     */
    function speedometer(samplesCount, min) {
      samplesCount = samplesCount || 10;
      const bytes = new Array(samplesCount);
      const timestamps = new Array(samplesCount);
      let head = 0;
      let tail = 0;
      let firstSampleTS;

      min = min !== undefined ? min : 1000;

      return function push(chunkLength) {
        const now = Date.now();

        const startedAt = timestamps[tail];

        if (!firstSampleTS) {
          firstSampleTS = now;
        }

        bytes[head] = chunkLength;
        timestamps[head] = now;

        let i = tail;
        let bytesCount = 0;

        while (i !== head) {
          bytesCount += bytes[i++];
          i = i % samplesCount;
        }

        head = (head + 1) % samplesCount;

        if (head === tail) {
          tail = (tail + 1) % samplesCount;
        }

        if (now - firstSampleTS < min) {
          return;
        }

        const passed = startedAt && now - startedAt;

        return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
      };
    }

    function progressEventReducer(listener, isDownloadStream) {
      let bytesNotified = 0;
      const _speedometer = speedometer(50, 250);

      return e => {
        const loaded = e.loaded;
        const total = e.lengthComputable ? e.total : undefined;
        const progressBytes = loaded - bytesNotified;
        const rate = _speedometer(progressBytes);
        const inRange = loaded <= total;

        bytesNotified = loaded;

        const data = {
          loaded,
          total,
          progress: total ? (loaded / total) : undefined,
          bytes: progressBytes,
          rate: rate ? rate : undefined,
          estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
          event: e
        };

        data[isDownloadStream ? 'download' : 'upload'] = true;

        listener(data);
      };
    }

    const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

    var xhrAdapter = isXHRAdapterSupported && function (config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        let requestData = config.data;
        const requestHeaders = AxiosHeaders$1.from(config.headers).normalize();
        const responseType = config.responseType;
        let onCanceled;
        function done() {
          if (config.cancelToken) {
            config.cancelToken.unsubscribe(onCanceled);
          }

          if (config.signal) {
            config.signal.removeEventListener('abort', onCanceled);
          }
        }

        if (utils.isFormData(requestData)) {
          if (platform.isStandardBrowserEnv || platform.isStandardBrowserWebWorkerEnv) {
            requestHeaders.setContentType(false); // Let the browser set it
          } else {
            requestHeaders.setContentType('multipart/form-data;', false); // mobile/desktop app frameworks
          }
        }

        let request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          const username = config.auth.username || '';
          const password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
          requestHeaders.set('Authorization', 'Basic ' + btoa(username + ':' + password));
        }

        const fullPath = buildFullPath(config.baseURL, config.url);

        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        function onloadend() {
          if (!request) {
            return;
          }
          // Prepare the response
          const responseHeaders = AxiosHeaders$1.from(
            'getAllResponseHeaders' in request && request.getAllResponseHeaders()
          );
          const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
            request.responseText : request.response;
          const response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request
          };

          settle(function _resolve(value) {
            resolve(value);
            done();
          }, function _reject(err) {
            reject(err);
            done();
          }, response);

          // Clean up request
          request = null;
        }

        if ('onloadend' in request) {
          // Use onloadend if available
          request.onloadend = onloadend;
        } else {
          // Listen for ready state to emulate onloadend
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }

            // The request errored out and we didn't get a response, this will be
            // handled by onerror instead
            // With one exception: request that using file: protocol, most browsers
            // will return status as 0 even though it's a successful request
            if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
              return;
            }
            // readystate handler is calling before onerror or ontimeout handlers,
            // so we should call onloadend on the next 'tick'
            setTimeout(onloadend);
          };
        }

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          let timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
          const transitional = config.transitional || transitionalDefaults;
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(new AxiosError(
            timeoutErrorMessage,
            transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
            config,
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (platform.isStandardBrowserEnv) {
          // Add xsrf header
          const xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath))
            && config.xsrfCookieName && cookies.read(config.xsrfCookieName);

          if (xsrfValue) {
            requestHeaders.set(config.xsrfHeaderName, xsrfValue);
          }
        }

        // Remove Content-Type if data is undefined
        requestData === undefined && requestHeaders.setContentType(null);

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
            request.setRequestHeader(key, val);
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (responseType && responseType !== 'json') {
          request.responseType = config.responseType;
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', progressEventReducer(config.onDownloadProgress, true));
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', progressEventReducer(config.onUploadProgress));
        }

        if (config.cancelToken || config.signal) {
          // Handle cancellation
          // eslint-disable-next-line func-names
          onCanceled = cancel => {
            if (!request) {
              return;
            }
            reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
            request.abort();
            request = null;
          };

          config.cancelToken && config.cancelToken.subscribe(onCanceled);
          if (config.signal) {
            config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
          }
        }

        const protocol = parseProtocol(fullPath);

        if (protocol && platform.protocols.indexOf(protocol) === -1) {
          reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
          return;
        }


        // Send the request
        request.send(requestData || null);
      });
    };

    const knownAdapters = {
      http: httpAdapter,
      xhr: xhrAdapter
    };

    utils.forEach(knownAdapters, (fn, value) => {
      if(fn) {
        try {
          Object.defineProperty(fn, 'name', {value});
        } catch (e) {
          // eslint-disable-next-line no-empty
        }
        Object.defineProperty(fn, 'adapterName', {value});
      }
    });

    var adapters = {
      getAdapter: (adapters) => {
        adapters = utils.isArray(adapters) ? adapters : [adapters];

        const {length} = adapters;
        let nameOrAdapter;
        let adapter;

        for (let i = 0; i < length; i++) {
          nameOrAdapter = adapters[i];
          if((adapter = utils.isString(nameOrAdapter) ? knownAdapters[nameOrAdapter.toLowerCase()] : nameOrAdapter)) {
            break;
          }
        }

        if (!adapter) {
          if (adapter === false) {
            throw new AxiosError(
              `Adapter ${nameOrAdapter} is not supported by the environment`,
              'ERR_NOT_SUPPORT'
            );
          }

          throw new Error(
            utils.hasOwnProp(knownAdapters, nameOrAdapter) ?
              `Adapter '${nameOrAdapter}' is not available in the build` :
              `Unknown adapter '${nameOrAdapter}'`
          );
        }

        if (!utils.isFunction(adapter)) {
          throw new TypeError('adapter is not a function');
        }

        return adapter;
      },
      adapters: knownAdapters
    };

    /**
     * Throws a `CanceledError` if cancellation has been requested.
     *
     * @param {Object} config The config that is to be used for the request
     *
     * @returns {void}
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      if (config.signal && config.signal.aborted) {
        throw new CanceledError(null, config);
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     *
     * @returns {Promise} The Promise to be fulfilled
     */
    function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      config.headers = AxiosHeaders$1.from(config.headers);

      // Transform request data
      config.data = transformData.call(
        config,
        config.transformRequest
      );

      if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
        config.headers.setContentType('application/x-www-form-urlencoded', false);
      }

      const adapter = adapters.getAdapter(config.adapter || defaults$1.adapter);

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData.call(
          config,
          config.transformResponse,
          response
        );

        response.headers = AxiosHeaders$1.from(response.headers);

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData.call(
              config,
              config.transformResponse,
              reason.response
            );
            reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
          }
        }

        return Promise.reject(reason);
      });
    }

    const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? thing.toJSON() : thing;

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     *
     * @returns {Object} New object resulting from merging config2 to config1
     */
    function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      const config = {};

      function getMergedValue(target, source, caseless) {
        if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
          return utils.merge.call({caseless}, target, source);
        } else if (utils.isPlainObject(source)) {
          return utils.merge({}, source);
        } else if (utils.isArray(source)) {
          return source.slice();
        }
        return source;
      }

      // eslint-disable-next-line consistent-return
      function mergeDeepProperties(a, b, caseless) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(a, b, caseless);
        } else if (!utils.isUndefined(a)) {
          return getMergedValue(undefined, a, caseless);
        }
      }

      // eslint-disable-next-line consistent-return
      function valueFromConfig2(a, b) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(undefined, b);
        }
      }

      // eslint-disable-next-line consistent-return
      function defaultToConfig2(a, b) {
        if (!utils.isUndefined(b)) {
          return getMergedValue(undefined, b);
        } else if (!utils.isUndefined(a)) {
          return getMergedValue(undefined, a);
        }
      }

      // eslint-disable-next-line consistent-return
      function mergeDirectKeys(a, b, prop) {
        if (prop in config2) {
          return getMergedValue(a, b);
        } else if (prop in config1) {
          return getMergedValue(undefined, a);
        }
      }

      const mergeMap = {
        url: valueFromConfig2,
        method: valueFromConfig2,
        data: valueFromConfig2,
        baseURL: defaultToConfig2,
        transformRequest: defaultToConfig2,
        transformResponse: defaultToConfig2,
        paramsSerializer: defaultToConfig2,
        timeout: defaultToConfig2,
        timeoutMessage: defaultToConfig2,
        withCredentials: defaultToConfig2,
        adapter: defaultToConfig2,
        responseType: defaultToConfig2,
        xsrfCookieName: defaultToConfig2,
        xsrfHeaderName: defaultToConfig2,
        onUploadProgress: defaultToConfig2,
        onDownloadProgress: defaultToConfig2,
        decompress: defaultToConfig2,
        maxContentLength: defaultToConfig2,
        maxBodyLength: defaultToConfig2,
        beforeRedirect: defaultToConfig2,
        transport: defaultToConfig2,
        httpAgent: defaultToConfig2,
        httpsAgent: defaultToConfig2,
        cancelToken: defaultToConfig2,
        socketPath: defaultToConfig2,
        responseEncoding: defaultToConfig2,
        validateStatus: mergeDirectKeys,
        headers: (a, b) => mergeDeepProperties(headersToObject(a), headersToObject(b), true)
      };

      utils.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
        const merge = mergeMap[prop] || mergeDeepProperties;
        const configValue = merge(config1[prop], config2[prop], prop);
        (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
      });

      return config;
    }

    const VERSION = "1.4.0";

    const validators$1 = {};

    // eslint-disable-next-line func-names
    ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
      validators$1[type] = function validator(thing) {
        return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
      };
    });

    const deprecatedWarnings = {};

    /**
     * Transitional option validator
     *
     * @param {function|boolean?} validator - set to false if the transitional option has been removed
     * @param {string?} version - deprecated version / removed since version
     * @param {string?} message - some message with additional info
     *
     * @returns {function}
     */
    validators$1.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
      }

      // eslint-disable-next-line func-names
      return (value, opt, opts) => {
        if (validator === false) {
          throw new AxiosError(
            formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
            AxiosError.ERR_DEPRECATED
          );
        }

        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          // eslint-disable-next-line no-console
          console.warn(
            formatMessage(
              opt,
              ' has been deprecated since v' + version + ' and will be removed in the near future'
            )
          );
        }

        return validator ? validator(value, opt, opts) : true;
      };
    };

    /**
     * Assert object's properties type
     *
     * @param {object} options
     * @param {object} schema
     * @param {boolean?} allowUnknown
     *
     * @returns {object}
     */

    function assertOptions(options, schema, allowUnknown) {
      if (typeof options !== 'object') {
        throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
      }
      const keys = Object.keys(options);
      let i = keys.length;
      while (i-- > 0) {
        const opt = keys[i];
        const validator = schema[opt];
        if (validator) {
          const value = options[opt];
          const result = value === undefined || validator(value, opt, options);
          if (result !== true) {
            throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
          }
          continue;
        }
        if (allowUnknown !== true) {
          throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
        }
      }
    }

    var validator = {
      assertOptions,
      validators: validators$1
    };

    const validators = validator.validators;

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     *
     * @return {Axios} A new instance of Axios
     */
    class Axios {
      constructor(instanceConfig) {
        this.defaults = instanceConfig;
        this.interceptors = {
          request: new InterceptorManager$1(),
          response: new InterceptorManager$1()
        };
      }

      /**
       * Dispatch a request
       *
       * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
       * @param {?Object} config
       *
       * @returns {Promise} The Promise to be fulfilled
       */
      request(configOrUrl, config) {
        /*eslint no-param-reassign:0*/
        // Allow for axios('example/url'[, config]) a la fetch API
        if (typeof configOrUrl === 'string') {
          config = config || {};
          config.url = configOrUrl;
        } else {
          config = configOrUrl || {};
        }

        config = mergeConfig(this.defaults, config);

        const {transitional, paramsSerializer, headers} = config;

        if (transitional !== undefined) {
          validator.assertOptions(transitional, {
            silentJSONParsing: validators.transitional(validators.boolean),
            forcedJSONParsing: validators.transitional(validators.boolean),
            clarifyTimeoutError: validators.transitional(validators.boolean)
          }, false);
        }

        if (paramsSerializer != null) {
          if (utils.isFunction(paramsSerializer)) {
            config.paramsSerializer = {
              serialize: paramsSerializer
            };
          } else {
            validator.assertOptions(paramsSerializer, {
              encode: validators.function,
              serialize: validators.function
            }, true);
          }
        }

        // Set config.method
        config.method = (config.method || this.defaults.method || 'get').toLowerCase();

        let contextHeaders;

        // Flatten headers
        contextHeaders = headers && utils.merge(
          headers.common,
          headers[config.method]
        );

        contextHeaders && utils.forEach(
          ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
          (method) => {
            delete headers[method];
          }
        );

        config.headers = AxiosHeaders$1.concat(contextHeaders, headers);

        // filter out skipped interceptors
        const requestInterceptorChain = [];
        let synchronousRequestInterceptors = true;
        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
          if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
            return;
          }

          synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

          requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });

        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
          responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });

        let promise;
        let i = 0;
        let len;

        if (!synchronousRequestInterceptors) {
          const chain = [dispatchRequest.bind(this), undefined];
          chain.unshift.apply(chain, requestInterceptorChain);
          chain.push.apply(chain, responseInterceptorChain);
          len = chain.length;

          promise = Promise.resolve(config);

          while (i < len) {
            promise = promise.then(chain[i++], chain[i++]);
          }

          return promise;
        }

        len = requestInterceptorChain.length;

        let newConfig = config;

        i = 0;

        while (i < len) {
          const onFulfilled = requestInterceptorChain[i++];
          const onRejected = requestInterceptorChain[i++];
          try {
            newConfig = onFulfilled(newConfig);
          } catch (error) {
            onRejected.call(this, error);
            break;
          }
        }

        try {
          promise = dispatchRequest.call(this, newConfig);
        } catch (error) {
          return Promise.reject(error);
        }

        i = 0;
        len = responseInterceptorChain.length;

        while (i < len) {
          promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
        }

        return promise;
      }

      getUri(config) {
        config = mergeConfig(this.defaults, config);
        const fullPath = buildFullPath(config.baseURL, config.url);
        return buildURL(fullPath, config.params, config.paramsSerializer);
      }
    }

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(mergeConfig(config || {}, {
          method,
          url,
          data: (config || {}).data
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/

      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(mergeConfig(config || {}, {
            method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url,
            data
          }));
        };
      }

      Axios.prototype[method] = generateHTTPMethod();

      Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
    });

    var Axios$1 = Axios;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @param {Function} executor The executor function.
     *
     * @returns {CancelToken}
     */
    class CancelToken {
      constructor(executor) {
        if (typeof executor !== 'function') {
          throw new TypeError('executor must be a function.');
        }

        let resolvePromise;

        this.promise = new Promise(function promiseExecutor(resolve) {
          resolvePromise = resolve;
        });

        const token = this;

        // eslint-disable-next-line func-names
        this.promise.then(cancel => {
          if (!token._listeners) return;

          let i = token._listeners.length;

          while (i-- > 0) {
            token._listeners[i](cancel);
          }
          token._listeners = null;
        });

        // eslint-disable-next-line func-names
        this.promise.then = onfulfilled => {
          let _resolve;
          // eslint-disable-next-line func-names
          const promise = new Promise(resolve => {
            token.subscribe(resolve);
            _resolve = resolve;
          }).then(onfulfilled);

          promise.cancel = function reject() {
            token.unsubscribe(_resolve);
          };

          return promise;
        };

        executor(function cancel(message, config, request) {
          if (token.reason) {
            // Cancellation has already been requested
            return;
          }

          token.reason = new CanceledError(message, config, request);
          resolvePromise(token.reason);
        });
      }

      /**
       * Throws a `CanceledError` if cancellation has been requested.
       */
      throwIfRequested() {
        if (this.reason) {
          throw this.reason;
        }
      }

      /**
       * Subscribe to the cancel signal
       */

      subscribe(listener) {
        if (this.reason) {
          listener(this.reason);
          return;
        }

        if (this._listeners) {
          this._listeners.push(listener);
        } else {
          this._listeners = [listener];
        }
      }

      /**
       * Unsubscribe from the cancel signal
       */

      unsubscribe(listener) {
        if (!this._listeners) {
          return;
        }
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
          this._listeners.splice(index, 1);
        }
      }

      /**
       * Returns an object that contains a new `CancelToken` and a function that, when called,
       * cancels the `CancelToken`.
       */
      static source() {
        let cancel;
        const token = new CancelToken(function executor(c) {
          cancel = c;
        });
        return {
          token,
          cancel
        };
      }
    }

    var CancelToken$1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     *
     * @returns {Function}
     */
    function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    }

    /**
     * Determines whether the payload is an error thrown by Axios
     *
     * @param {*} payload The value to test
     *
     * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
     */
    function isAxiosError(payload) {
      return utils.isObject(payload) && (payload.isAxiosError === true);
    }

    const HttpStatusCode = {
      Continue: 100,
      SwitchingProtocols: 101,
      Processing: 102,
      EarlyHints: 103,
      Ok: 200,
      Created: 201,
      Accepted: 202,
      NonAuthoritativeInformation: 203,
      NoContent: 204,
      ResetContent: 205,
      PartialContent: 206,
      MultiStatus: 207,
      AlreadyReported: 208,
      ImUsed: 226,
      MultipleChoices: 300,
      MovedPermanently: 301,
      Found: 302,
      SeeOther: 303,
      NotModified: 304,
      UseProxy: 305,
      Unused: 306,
      TemporaryRedirect: 307,
      PermanentRedirect: 308,
      BadRequest: 400,
      Unauthorized: 401,
      PaymentRequired: 402,
      Forbidden: 403,
      NotFound: 404,
      MethodNotAllowed: 405,
      NotAcceptable: 406,
      ProxyAuthenticationRequired: 407,
      RequestTimeout: 408,
      Conflict: 409,
      Gone: 410,
      LengthRequired: 411,
      PreconditionFailed: 412,
      PayloadTooLarge: 413,
      UriTooLong: 414,
      UnsupportedMediaType: 415,
      RangeNotSatisfiable: 416,
      ExpectationFailed: 417,
      ImATeapot: 418,
      MisdirectedRequest: 421,
      UnprocessableEntity: 422,
      Locked: 423,
      FailedDependency: 424,
      TooEarly: 425,
      UpgradeRequired: 426,
      PreconditionRequired: 428,
      TooManyRequests: 429,
      RequestHeaderFieldsTooLarge: 431,
      UnavailableForLegalReasons: 451,
      InternalServerError: 500,
      NotImplemented: 501,
      BadGateway: 502,
      ServiceUnavailable: 503,
      GatewayTimeout: 504,
      HttpVersionNotSupported: 505,
      VariantAlsoNegotiates: 506,
      InsufficientStorage: 507,
      LoopDetected: 508,
      NotExtended: 510,
      NetworkAuthenticationRequired: 511,
    };

    Object.entries(HttpStatusCode).forEach(([key, value]) => {
      HttpStatusCode[value] = key;
    });

    var HttpStatusCode$1 = HttpStatusCode;

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     *
     * @returns {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      const context = new Axios$1(defaultConfig);
      const instance = bind(Axios$1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios$1.prototype, context, {allOwnKeys: true});

      // Copy context to instance
      utils.extend(instance, context, null, {allOwnKeys: true});

      // Factory for creating new instances
      instance.create = function create(instanceConfig) {
        return createInstance(mergeConfig(defaultConfig, instanceConfig));
      };

      return instance;
    }

    // Create the default instance to be exported
    const axios = createInstance(defaults$1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios$1;

    // Expose Cancel & CancelToken
    axios.CanceledError = CanceledError;
    axios.CancelToken = CancelToken$1;
    axios.isCancel = isCancel;
    axios.VERSION = VERSION;
    axios.toFormData = toFormData;

    // Expose AxiosError class
    axios.AxiosError = AxiosError;

    // alias for CanceledError for backward compatibility
    axios.Cancel = axios.CanceledError;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };

    axios.spread = spread;

    // Expose isAxiosError
    axios.isAxiosError = isAxiosError;

    // Expose mergeConfig
    axios.mergeConfig = mergeConfig;

    axios.AxiosHeaders = AxiosHeaders$1;

    axios.formToJSON = thing => formDataToJSON(utils.isHTMLForm(thing) ? new FormData(thing) : thing);

    axios.HttpStatusCode = HttpStatusCode$1;

    axios.default = axios;

    // this module should only have a default export
    var axios$1 = axios;

    axios$1.create();
    const app = new App({
        target: document.body,
    });
    console.log('hello world');

    return app;

})();
//# sourceMappingURL=bundle.js.map
