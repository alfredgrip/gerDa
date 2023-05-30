
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
            update: noop,
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
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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
    	let t42;
    	let div11;
    	let button2;

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
    			t42 = space();
    			div11 = element("div");
    			button2 = element("button");
    			button2.textContent = "Generera dokument!";
    			add_location(h1, file$6, 4, 12, 67);
    			attr_dev(label0, "for", "title");
    			attr_dev(label0, "class", "svelte-dtatxb");
    			add_location(label0, file$6, 6, 16, 138);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "title");
    			attr_dev(input0, "id", "title");
    			attr_dev(input0, "placeholder", "Titel");
    			attr_dev(input0, "class", "svelte-dtatxb");
    			add_location(input0, file$6, 7, 16, 188);
    			attr_dev(label1, "for", "meeting");
    			attr_dev(label1, "class", "svelte-dtatxb");
    			add_location(label1, file$6, 8, 16, 270);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "meeting");
    			attr_dev(input1, "id", "meeting");
    			attr_dev(input1, "placeholder", "t.ex. VTM, S05");
    			attr_dev(input1, "class", "svelte-dtatxb");
    			add_location(input1, file$6, 9, 16, 321);
    			attr_dev(div0, "class", "info-circle svelte-dtatxb");
    			add_location(div0, file$6, 18, 24, 649);
    			add_location(br0, file$6, 22, 28, 877);
    			add_location(br1, file$6, 22, 34, 883);
    			add_location(br2, file$6, 25, 28, 1065);
    			add_location(br3, file$6, 25, 34, 1071);
    			attr_dev(div1, "class", "explanation svelte-dtatxb");
    			add_location(div1, file$6, 19, 24, 706);
    			attr_dev(label2, "for", "body");
    			attr_dev(label2, "id", "bodyLabel");
    			attr_dev(label2, "class", "svelte-dtatxb");
    			add_location(label2, file$6, 16, 20, 557);
    			attr_dev(textarea, "name", "body");
    			attr_dev(textarea, "id", "body");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			attr_dev(textarea, "placeholder", "Jag tycker att det sjungs för lite på...");
    			attr_dev(textarea, "class", "svelte-dtatxb");
    			add_location(textarea, file$6, 29, 20, 1239);
    			attr_dev(div2, "id", "bodyContainer");
    			attr_dev(div2, "class", "svelte-dtatxb");
    			add_location(div2, file$6, 15, 16, 512);
    			attr_dev(div3, "class", "info-circle svelte-dtatxb");
    			add_location(div3, file$6, 42, 28, 1703);
    			add_location(br4, file$6, 46, 28, 1984);
    			add_location(br5, file$6, 46, 34, 1990);
    			add_location(br6, file$6, 49, 28, 2180);
    			add_location(br7, file$6, 49, 34, 2186);
    			attr_dev(div4, "class", "explanation svelte-dtatxb");
    			add_location(div4, file$6, 41, 24, 1649);
    			attr_dev(label3, "class", "svelte-dtatxb");
    			add_location(label3, file$6, 39, 20, 1581);
    			attr_dev(label4, "for", "clause1");
    			attr_dev(label4, "class", "svelte-dtatxb");
    			add_location(label4, file$6, 56, 24, 2597);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "clause");
    			attr_dev(input2, "id", "clause1");
    			attr_dev(input2, "placeholder", "Att-sats");
    			attr_dev(input2, "class", "svelte-dtatxb");
    			add_location(input2, file$6, 57, 24, 2652);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "description");
    			attr_dev(input3, "id", "description1");
    			attr_dev(input3, "placeholder", "Beskrivning (frivillig)");
    			attr_dev(input3, "class", "svelte-dtatxb");
    			add_location(input3, file$6, 63, 24, 2884);
    			attr_dev(div5, "class", "clauseFields");
    			add_location(div5, file$6, 55, 20, 2546);
    			attr_dev(div6, "id", "clausesContainer");
    			attr_dev(div6, "class", "svelte-dtatxb");
    			add_location(div6, file$6, 38, 16, 1533);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "id", "addClauseButton");
    			attr_dev(button0, "class", "svelte-dtatxb");
    			add_location(button0, file$6, 71, 16, 3183);
    			attr_dev(label5, "for", "signMessage");
    			attr_dev(label5, "class", "svelte-dtatxb");
    			add_location(label5, file$6, 75, 16, 3313);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "name", "signMessage");
    			attr_dev(input4, "id", "signMessage");
    			attr_dev(input4, "placeholder", "För D-sektionen,");
    			attr_dev(input4, "class", "svelte-dtatxb");
    			add_location(input4, file$6, 76, 16, 3382);
    			attr_dev(div7, "class", "info-circle svelte-dtatxb");
    			add_location(div7, file$6, 86, 24, 3704);
    			add_location(br8, file$6, 90, 28, 3939);
    			add_location(br9, file$6, 90, 34, 3945);
    			attr_dev(div8, "class", "explanation svelte-dtatxb");
    			add_location(div8, file$6, 87, 24, 3761);
    			attr_dev(label6, "class", "svelte-dtatxb");
    			add_location(label6, file$6, 84, 20, 3636);
    			attr_dev(label7, "for", "author1");
    			attr_dev(label7, "class", "svelte-dtatxb");
    			add_location(label7, file$6, 98, 24, 4386);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "name", "name");
    			attr_dev(input5, "id", "name1");
    			attr_dev(input5, "placeholder", "Namn");
    			attr_dev(input5, "class", "svelte-dtatxb");
    			add_location(input5, file$6, 99, 24, 4441);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "name", "position");
    			attr_dev(input6, "id", "position1");
    			attr_dev(input6, "placeholder", "Post (frivillig)");
    			attr_dev(input6, "class", "svelte-dtatxb");
    			add_location(input6, file$6, 105, 24, 4665);
    			attr_dev(div9, "class", "authorFields");
    			add_location(div9, file$6, 97, 20, 4335);
    			attr_dev(div10, "id", "authorsContainer");
    			attr_dev(div10, "class", "svelte-dtatxb");
    			add_location(div10, file$6, 83, 16, 3588);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "id", "addAuthorButton");
    			attr_dev(button1, "class", "svelte-dtatxb");
    			add_location(button1, file$6, 113, 16, 4951);
    			attr_dev(button2, "type", "submit");
    			attr_dev(button2, "id", "generateButton");
    			attr_dev(button2, "class", "svelte-dtatxb");
    			add_location(button2, file$6, 117, 20, 5104);
    			add_location(div11, file$6, 116, 16, 5078);
    			attr_dev(form, "id", "documentform");
    			attr_dev(form, "class", "svelte-dtatxb");
    			add_location(form, file$6, 5, 12, 97);
    			attr_dev(body, "class", "svelte-dtatxb");
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
    			append_dev(form, t42);
    			append_dev(form, div11);
    			append_dev(div11, button2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
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

    function create_fragment$5(ctx) {
    	let div1;
    	let label;
    	let t0;
    	let t1;
    	let div0;
    	let input0;
    	let t2;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			label = element("label");
    			t0 = text(/*nbr*/ ctx[2]);
    			t1 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			attr_dev(label, "for", "author-text");
    			attr_dev(label, "class", "svelte-5iu0mt");
    			add_location(label, file$5, 7, 4, 134);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "name");
    			attr_dev(input0, "placeholder", "Namn");
    			attr_dev(input0, "class", "svelte-5iu0mt");
    			add_location(input0, file$5, 9, 8, 211);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "position");
    			attr_dev(input1, "placeholder", "Post (frivillig)");
    			attr_dev(input1, "class", "svelte-5iu0mt");
    			add_location(input1, file$5, 10, 8, 287);
    			attr_dev(div0, "class", "author-text svelte-5iu0mt");
    			add_location(div0, file$5, 8, 4, 177);
    			attr_dev(div1, "class", "author svelte-5iu0mt");
    			add_location(div1, file$5, 6, 0, 109);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(label, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*name*/ ctx[0]);
    			append_dev(div0, t2);
    			append_dev(div0, input1);
    			set_input_value(input1, /*position*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[3]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*nbr*/ 4) set_data_dev(t0, /*nbr*/ ctx[2]);

    			if (dirty & /*name*/ 1 && input0.value !== /*name*/ ctx[0]) {
    				set_input_value(input0, /*name*/ ctx[0]);
    			}

    			if (dirty & /*position*/ 2 && input1.value !== /*position*/ ctx[1]) {
    				set_input_value(input1, /*position*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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
    	let { nbr } = $$props;
    	let { name } = $$props;
    	let { position } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (nbr === undefined && !('nbr' in $$props || $$self.$$.bound[$$self.$$.props['nbr']])) {
    			console.warn("<Author> was created without expected prop 'nbr'");
    		}

    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<Author> was created without expected prop 'name'");
    		}

    		if (position === undefined && !('position' in $$props || $$self.$$.bound[$$self.$$.props['position']])) {
    			console.warn("<Author> was created without expected prop 'position'");
    		}
    	});

    	const writable_props = ['nbr', 'name', 'position'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Author> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	function input1_input_handler() {
    		position = this.value;
    		$$invalidate(1, position);
    	}

    	$$self.$$set = $$props => {
    		if ('nbr' in $$props) $$invalidate(2, nbr = $$props.nbr);
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('position' in $$props) $$invalidate(1, position = $$props.position);
    	};

    	$$self.$capture_state = () => ({ nbr, name, position });

    	$$self.$inject_state = $$props => {
    		if ('nbr' in $$props) $$invalidate(2, nbr = $$props.nbr);
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('position' in $$props) $$invalidate(1, position = $$props.position);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, position, nbr, input0_input_handler, input1_input_handler];
    }

    class Author extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { nbr: 2, name: 0, position: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Author",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get nbr() {
    		throw new Error("<Author>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nbr(value) {
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

    const { console: console_1 } = globals;
    const file$4 = "src/Clause.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let label;
    	let t0;
    	let t1;
    	let div0;
    	let input0;
    	let t2;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			label = element("label");
    			t0 = text(/*id*/ ctx[2]);
    			t1 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			attr_dev(label, "for", "clause-text");
    			attr_dev(label, "class", "svelte-gsrhst");
    			add_location(label, file$4, 13, 4, 307);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "clause-text");
    			input0.value = /*clauseText*/ ctx[0];
    			attr_dev(input0, "placeholder", "att-sats");
    			attr_dev(input0, "class", "svelte-gsrhst");
    			add_location(input0, file$4, 15, 8, 383);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "description-text");
    			input1.value = /*descriptionText*/ ctx[1];
    			attr_dev(input1, "placeholder", "Beskrivning (frivillig)");
    			attr_dev(input1, "class", "svelte-gsrhst");
    			add_location(input1, file$4, 22, 8, 569);
    			attr_dev(div0, "class", "clause-text svelte-gsrhst");
    			add_location(div0, file$4, 14, 4, 349);
    			attr_dev(div1, "class", "clause svelte-gsrhst");
    			add_location(div1, file$4, 12, 0, 282);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label);
    			append_dev(label, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			append_dev(div0, t2);
    			append_dev(div0, input1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*updateClauseText*/ ctx[3], false, false, false, false),
    					listen_dev(input1, "change", /*updateDescriptionText*/ ctx[4], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 4) set_data_dev(t0, /*id*/ ctx[2]);

    			if (dirty & /*clauseText*/ 1 && input0.value !== /*clauseText*/ ctx[0]) {
    				prop_dev(input0, "value", /*clauseText*/ ctx[0]);
    			}

    			if (dirty & /*descriptionText*/ 2 && input1.value !== /*descriptionText*/ ctx[1]) {
    				prop_dev(input1, "value", /*descriptionText*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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
    	let { id } = $$props;
    	let { clauseText } = $$props;
    	let { descriptionText } = $$props;

    	function updateClauseText(event) {
    		$$invalidate(0, clauseText = event.target.value);
    		console.log(clauseText);
    	}

    	function updateDescriptionText(event) {
    		$$invalidate(1, descriptionText = event.target.value);
    	}

    	$$self.$$.on_mount.push(function () {
    		if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
    			console_1.warn("<Clause> was created without expected prop 'id'");
    		}

    		if (clauseText === undefined && !('clauseText' in $$props || $$self.$$.bound[$$self.$$.props['clauseText']])) {
    			console_1.warn("<Clause> was created without expected prop 'clauseText'");
    		}

    		if (descriptionText === undefined && !('descriptionText' in $$props || $$self.$$.bound[$$self.$$.props['descriptionText']])) {
    			console_1.warn("<Clause> was created without expected prop 'descriptionText'");
    		}
    	});

    	const writable_props = ['id', 'clauseText', 'descriptionText'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Clause> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    		if ('clauseText' in $$props) $$invalidate(0, clauseText = $$props.clauseText);
    		if ('descriptionText' in $$props) $$invalidate(1, descriptionText = $$props.descriptionText);
    	};

    	$$self.$capture_state = () => ({
    		id,
    		clauseText,
    		descriptionText,
    		updateClauseText,
    		updateDescriptionText
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    		if ('clauseText' in $$props) $$invalidate(0, clauseText = $$props.clauseText);
    		if ('descriptionText' in $$props) $$invalidate(1, descriptionText = $$props.descriptionText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [clauseText, descriptionText, id, updateClauseText, updateDescriptionText];
    }

    class Clause extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { id: 2, clauseText: 0, descriptionText: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clause",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get id() {
    		throw new Error("<Clause>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
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
    function writable(value, start = noop) {
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
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
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
    const file$3 = "src/MotionForm.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (93:20) {#each $clauses as clause, index (clause.id)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let clause;
    	let t0;
    	let button;
    	let t1;
    	let t2_value = /*clause*/ ctx[15].id + "";
    	let t2;
    	let current;
    	let mounted;
    	let dispose;

    	clause = new Clause({
    			props: {
    				id: /*index*/ ctx[17],
    				clauseText: /*clause*/ ctx[15].clauseText,
    				descriptionText: /*clause*/ ctx[15].descriptionText
    			},
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[10](/*clause*/ ctx[15]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(clause.$$.fragment);
    			t0 = space();
    			button = element("button");
    			t1 = text("Ta bort att-sats ");
    			t2 = text(t2_value);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "id", "removeClauseButton");

    			attr_dev(button, "style", /*numberOfClauses*/ ctx[3]() === 1
    			? "display: none;"
    			: "");

    			attr_dev(button, "class", "svelte-7a7olh");
    			add_location(button, file$3, 98, 24, 2970);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(clause, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, t1);
    			append_dev(button, t2);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const clause_changes = {};
    			if (dirty & /*$clauses*/ 2) clause_changes.id = /*index*/ ctx[17];
    			if (dirty & /*$clauses*/ 2) clause_changes.clauseText = /*clause*/ ctx[15].clauseText;
    			if (dirty & /*$clauses*/ 2) clause_changes.descriptionText = /*clause*/ ctx[15].descriptionText;
    			clause.$set(clause_changes);
    			if ((!current || dirty & /*$clauses*/ 2) && t2_value !== (t2_value = /*clause*/ ctx[15].id + "")) set_data_dev(t2, t2_value);
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
    			if (detaching) detach_dev(first);
    			destroy_component(clause, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(93:20) {#each $clauses as clause, index (clause.id)}",
    		ctx
    	});

    	return block;
    }

    // (125:20) {#each $authors as author}
    function create_each_block$1(ctx) {
    	let author;
    	let t0;
    	let button;
    	let t1;
    	let t2_value = /*author*/ ctx[12].id + "";
    	let t2;
    	let current;
    	let mounted;
    	let dispose;

    	author = new Author({
    			props: {
    				nbr: /*author*/ ctx[12].id,
    				name: /*author*/ ctx[12].name,
    				position: /*author*/ ctx[12].position
    			},
    			$$inline: true
    		});

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[11](/*author*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			create_component(author.$$.fragment);
    			t0 = space();
    			button = element("button");
    			t1 = text("Ta bort författare ");
    			t2 = text(t2_value);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "id", "removeAuthorButton");

    			attr_dev(button, "style", /*numberOfAuthors*/ ctx[7]() === 1
    			? "display: none;"
    			: "");

    			attr_dev(button, "class", "svelte-7a7olh");
    			add_location(button, file$3, 130, 24, 4205);
    		},
    		m: function mount(target, anchor) {
    			mount_component(author, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, t1);
    			append_dev(button, t2);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const author_changes = {};
    			if (dirty & /*$authors*/ 1) author_changes.nbr = /*author*/ ctx[12].id;
    			if (dirty & /*$authors*/ 1) author_changes.name = /*author*/ ctx[12].name;
    			if (dirty & /*$authors*/ 1) author_changes.position = /*author*/ ctx[12].position;
    			author.$set(author_changes);
    			if ((!current || dirty & /*$authors*/ 1) && t2_value !== (t2_value = /*author*/ ctx[12].id + "")) set_data_dev(t2, t2_value);
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
    			destroy_component(author, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(125:20) {#each $authors as author}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
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
    	let div7;
    	let h21;
    	let t25;
    	let div5;
    	let t26;
    	let button1;
    	let t28;
    	let div6;
    	let button2;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*$clauses*/ ctx[1];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*clause*/ ctx[15].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*$authors*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			body = element("body");
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
    			div7 = element("div");
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
    			div6 = element("div");
    			button2 = element("button");
    			button2.textContent = "Generera dokument!";
    			add_location(h1, file$3, 55, 8, 1209);
    			attr_dev(label0, "for", "title");
    			attr_dev(label0, "class", "svelte-7a7olh");
    			add_location(label0, file$3, 57, 12, 1270);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "title");
    			attr_dev(input0, "id", "title");
    			attr_dev(input0, "placeholder", "Titel");
    			attr_dev(input0, "class", "svelte-7a7olh");
    			add_location(input0, file$3, 58, 12, 1316);
    			attr_dev(label1, "for", "meeting");
    			attr_dev(label1, "class", "svelte-7a7olh");
    			add_location(label1, file$3, 59, 12, 1394);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "meeting");
    			attr_dev(input1, "id", "meeting");
    			attr_dev(input1, "placeholder", "t.ex. VTM, S05");
    			attr_dev(input1, "class", "svelte-7a7olh");
    			add_location(input1, file$3, 60, 12, 1441);
    			attr_dev(div0, "class", "info-circle svelte-7a7olh");
    			add_location(div0, file$3, 69, 20, 1733);
    			add_location(br0, file$3, 73, 24, 1945);
    			add_location(br1, file$3, 73, 30, 1951);
    			add_location(br2, file$3, 76, 24, 2121);
    			add_location(br3, file$3, 76, 30, 2127);
    			attr_dev(div1, "class", "explanation svelte-7a7olh");
    			add_location(div1, file$3, 70, 20, 1786);
    			attr_dev(label2, "for", "body");
    			attr_dev(label2, "id", "bodyLabel");
    			attr_dev(label2, "class", "svelte-7a7olh");
    			add_location(label2, file$3, 67, 16, 1649);
    			attr_dev(textarea, "name", "body");
    			attr_dev(textarea, "id", "body");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			attr_dev(textarea, "placeholder", "Jag tycker att det sjungs för lite på...");
    			attr_dev(textarea, "class", "svelte-7a7olh");
    			add_location(textarea, file$3, 80, 16, 2279);
    			attr_dev(div2, "id", "bodyContainer");
    			attr_dev(div2, "class", "svelte-7a7olh");
    			add_location(div2, file$3, 66, 12, 1608);
    			add_location(h20, file$3, 90, 16, 2587);
    			attr_dev(div3, "class", "clausesContainer");
    			add_location(div3, file$3, 91, 16, 2623);
    			attr_dev(div4, "id", "outer-clause-container");
    			attr_dev(div4, "class", "svelte-7a7olh");
    			add_location(div4, file$3, 89, 12, 2537);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "id", "addClauseButton");
    			attr_dev(button0, "class", "svelte-7a7olh");
    			add_location(button0, file$3, 109, 12, 3434);
    			attr_dev(label3, "for", "signMessage");
    			attr_dev(label3, "class", "svelte-7a7olh");
    			add_location(label3, file$3, 113, 12, 3569);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "signMessage");
    			attr_dev(input2, "id", "signMessage");
    			attr_dev(input2, "placeholder", "För D-sektionen,");
    			attr_dev(input2, "class", "svelte-7a7olh");
    			add_location(input2, file$3, 114, 12, 3634);
    			add_location(h21, file$3, 122, 16, 3862);
    			attr_dev(div5, "class", "authorsContainer");
    			add_location(div5, file$3, 123, 16, 3898);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "id", "addAuthorButton");
    			attr_dev(button1, "class", "svelte-7a7olh");
    			add_location(button1, file$3, 140, 16, 4656);
    			attr_dev(button2, "type", "submit");
    			attr_dev(button2, "id", "generateButton");
    			attr_dev(button2, "class", "svelte-7a7olh");
    			add_location(button2, file$3, 145, 20, 4831);
    			add_location(div6, file$3, 144, 16, 4805);
    			attr_dev(div7, "id", "outer-author-container");
    			attr_dev(div7, "class", "svelte-7a7olh");
    			add_location(div7, file$3, 121, 12, 3812);
    			attr_dev(form, "id", "documentform");
    			attr_dev(form, "class", "svelte-7a7olh");
    			add_location(form, file$3, 56, 8, 1233);
    			attr_dev(body, "class", "svelte-7a7olh");
    			add_location(body, file$3, 54, 4, 1194);
    			add_location(main, file$3, 53, 0, 1183);
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
    			append_dev(form, div4);
    			append_dev(div4, h20);
    			append_dev(div4, t17);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(div3, null);
    				}
    			}

    			append_dev(form, t18);
    			append_dev(form, button0);
    			append_dev(form, t20);
    			append_dev(form, label3);
    			append_dev(form, t22);
    			append_dev(form, input2);
    			append_dev(form, t23);
    			append_dev(form, div7);
    			append_dev(div7, h21);
    			append_dev(div7, t25);
    			append_dev(div7, div5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div5, null);
    				}
    			}

    			append_dev(div7, t26);
    			append_dev(div7, button1);
    			append_dev(div7, t28);
    			append_dev(div7, div6);
    			append_dev(div6, button2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*addClause*/ ctx[4], false, false, false, false),
    					listen_dev(button1, "click", /*addAuthor*/ ctx[8], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*numberOfClauses, removeClause, $clauses*/ 42) {
    				each_value_1 = /*$clauses*/ ctx[1];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div3, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    				check_outros();
    			}

    			if (dirty & /*numberOfAuthors, removeAuthor, $authors*/ 641) {
    				each_value = /*$authors*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div5, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

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

    			each_blocks = each_blocks.filter(Boolean);

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

    			destroy_each(each_blocks, detaching);
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

    	let clauses = writable([
    		{
    			id: 1,
    			clauseText: "",
    			descriptionText: ""
    		}
    	]);

    	validate_store(clauses, 'clauses');
    	component_subscribe($$self, clauses, value => $$invalidate(1, $clauses = value));

    	function numberOfClauses() {
    		return $clauses.length;
    	}

    	function addClause() {
    		clauses.update(clauses => [
    			...clauses,
    			{
    				id: numberOfClauses() + 1,
    				clauseText: "",
    				descriptionText: ""
    			}
    		]);
    	}

    	function removeClause(id) {
    		clauses.update(clauses => clauses.filter(clause => clause.id !== id));
    	}

    	let authors = writable([{ id: 1, name: "", position: "" }]);
    	validate_store(authors, 'authors');
    	component_subscribe($$self, authors, value => $$invalidate(0, $authors = value));

    	function numberOfAuthors() {
    		return $authors.length;
    	}

    	function addAuthor() {
    		authors.update(authors => [
    			...authors,
    			{
    				id: numberOfAuthors() + 1,
    				name: "",
    				position: ""
    			}
    		]);
    	}

    	function removeAuthor(id) {
    		authors.update(authors => authors.filter(author => author.id !== id));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MotionForm> was created with unknown prop '${key}'`);
    	});

    	const click_handler = clause => removeClause(clause.id);
    	const click_handler_1 = author => removeAuthor(author.id);

    	$$self.$capture_state = () => ({
    		Author,
    		Clause,
    		writable,
    		clauses,
    		numberOfClauses,
    		addClause,
    		removeClause,
    		authors,
    		numberOfAuthors,
    		addAuthor,
    		removeAuthor,
    		$authors,
    		$clauses
    	});

    	$$self.$inject_state = $$props => {
    		if ('clauses' in $$props) $$invalidate(2, clauses = $$props.clauses);
    		if ('authors' in $$props) $$invalidate(6, authors = $$props.authors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		$authors,
    		$clauses,
    		clauses,
    		numberOfClauses,
    		addClause,
    		removeClause,
    		authors,
    		numberOfAuthors,
    		addAuthor,
    		removeAuthor,
    		click_handler,
    		click_handler_1
    	];
    }

    class MotionForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MotionForm",
    			options,
    			id: create_fragment$3.name
    		});
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
    	let t42;
    	let div11;
    	let button2;

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
    			t42 = space();
    			div11 = element("div");
    			button2 = element("button");
    			button2.textContent = "Generera dokument!";
    			add_location(h1, file$2, 4, 8, 55);
    			attr_dev(label0, "for", "title");
    			attr_dev(label0, "class", "svelte-3ivj9d");
    			add_location(label0, file$2, 6, 12, 121);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "title");
    			attr_dev(input0, "id", "title");
    			attr_dev(input0, "placeholder", "Titel");
    			attr_dev(input0, "class", "svelte-3ivj9d");
    			add_location(input0, file$2, 7, 12, 167);
    			attr_dev(label1, "for", "meeting");
    			attr_dev(label1, "class", "svelte-3ivj9d");
    			add_location(label1, file$2, 8, 12, 245);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "meeting");
    			attr_dev(input1, "id", "meeting");
    			attr_dev(input1, "placeholder", "t.ex. VTM, S05");
    			attr_dev(input1, "class", "svelte-3ivj9d");
    			add_location(input1, file$2, 9, 12, 292);
    			attr_dev(div0, "class", "info-circle svelte-3ivj9d");
    			add_location(div0, file$2, 18, 20, 584);
    			add_location(br0, file$2, 22, 24, 796);
    			add_location(br1, file$2, 22, 30, 802);
    			add_location(br2, file$2, 25, 24, 972);
    			add_location(br3, file$2, 25, 30, 978);
    			attr_dev(div1, "class", "explanation svelte-3ivj9d");
    			add_location(div1, file$2, 19, 20, 637);
    			attr_dev(label2, "for", "body");
    			attr_dev(label2, "id", "bodyLabel");
    			attr_dev(label2, "class", "svelte-3ivj9d");
    			add_location(label2, file$2, 16, 16, 500);
    			attr_dev(textarea, "name", "body");
    			attr_dev(textarea, "id", "body");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			attr_dev(textarea, "placeholder", "Jag tycker att det sjungs för lite på...");
    			attr_dev(textarea, "class", "svelte-3ivj9d");
    			add_location(textarea, file$2, 29, 16, 1130);
    			attr_dev(div2, "id", "bodyContainer");
    			attr_dev(div2, "class", "svelte-3ivj9d");
    			add_location(div2, file$2, 15, 12, 459);
    			attr_dev(div3, "class", "info-circle svelte-3ivj9d");
    			add_location(div3, file$2, 42, 24, 1542);
    			add_location(br4, file$2, 46, 24, 1807);
    			add_location(br5, file$2, 46, 30, 1813);
    			add_location(br6, file$2, 49, 24, 1991);
    			add_location(br7, file$2, 49, 30, 1997);
    			attr_dev(div4, "class", "explanation svelte-3ivj9d");
    			add_location(div4, file$2, 41, 20, 1492);
    			attr_dev(label3, "class", "svelte-3ivj9d");
    			add_location(label3, file$2, 39, 16, 1432);
    			attr_dev(label4, "for", "clause1");
    			attr_dev(label4, "class", "svelte-3ivj9d");
    			add_location(label4, file$2, 56, 20, 2380);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "name", "clause");
    			attr_dev(input2, "id", "clause1");
    			attr_dev(input2, "placeholder", "Att-sats");
    			attr_dev(input2, "class", "svelte-3ivj9d");
    			add_location(input2, file$2, 57, 20, 2431);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "description");
    			attr_dev(input3, "id", "description1");
    			attr_dev(input3, "placeholder", "Beskrivning (frivillig)");
    			attr_dev(input3, "class", "svelte-3ivj9d");
    			add_location(input3, file$2, 63, 20, 2639);
    			attr_dev(div5, "class", "clauseFields");
    			add_location(div5, file$2, 55, 16, 2333);
    			attr_dev(div6, "id", "clausesContainer");
    			attr_dev(div6, "class", "svelte-3ivj9d");
    			add_location(div6, file$2, 38, 12, 1388);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "id", "addClauseButton");
    			attr_dev(button0, "class", "svelte-3ivj9d");
    			add_location(button0, file$2, 71, 12, 2906);
    			attr_dev(label5, "for", "signMessage");
    			attr_dev(label5, "class", "svelte-3ivj9d");
    			add_location(label5, file$2, 75, 12, 3020);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "name", "signMessage");
    			attr_dev(input4, "id", "signMessage");
    			attr_dev(input4, "placeholder", "För D-sektionen,");
    			attr_dev(input4, "class", "svelte-3ivj9d");
    			add_location(input4, file$2, 76, 12, 3085);
    			attr_dev(div7, "class", "info-circle svelte-3ivj9d");
    			add_location(div7, file$2, 86, 20, 3367);
    			add_location(br8, file$2, 90, 24, 3586);
    			add_location(br9, file$2, 90, 30, 3592);
    			attr_dev(div8, "class", "explanation svelte-3ivj9d");
    			add_location(div8, file$2, 87, 20, 3420);
    			attr_dev(label6, "class", "svelte-3ivj9d");
    			add_location(label6, file$2, 84, 16, 3307);
    			attr_dev(label7, "for", "author1");
    			attr_dev(label7, "class", "svelte-3ivj9d");
    			add_location(label7, file$2, 98, 20, 4001);
    			attr_dev(input5, "type", "text");
    			attr_dev(input5, "name", "name");
    			attr_dev(input5, "id", "name1");
    			attr_dev(input5, "placeholder", "Namn");
    			attr_dev(input5, "class", "svelte-3ivj9d");
    			add_location(input5, file$2, 99, 20, 4052);
    			attr_dev(input6, "type", "text");
    			attr_dev(input6, "name", "position");
    			attr_dev(input6, "id", "position1");
    			attr_dev(input6, "placeholder", "Post (frivillig)");
    			attr_dev(input6, "class", "svelte-3ivj9d");
    			add_location(input6, file$2, 105, 20, 4252);
    			attr_dev(div9, "class", "authorFields");
    			add_location(div9, file$2, 97, 16, 3954);
    			attr_dev(div10, "id", "authorsContainer");
    			attr_dev(div10, "class", "svelte-3ivj9d");
    			add_location(div10, file$2, 83, 12, 3263);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "id", "addAuthorButton");
    			attr_dev(button1, "class", "svelte-3ivj9d");
    			add_location(button1, file$2, 113, 12, 4506);
    			attr_dev(button2, "type", "submit");
    			attr_dev(button2, "id", "generateButton");
    			attr_dev(button2, "class", "svelte-3ivj9d");
    			add_location(button2, file$2, 117, 16, 4643);
    			add_location(div11, file$2, 116, 12, 4621);
    			attr_dev(form, "id", "documentform");
    			attr_dev(form, "class", "svelte-3ivj9d");
    			add_location(form, file$2, 5, 8, 84);
    			attr_dev(body, "class", "svelte-3ivj9d");
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
    			append_dev(form, t42);
    			append_dev(form, div11);
    			append_dev(div11, button2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
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
    const file$1 = "src/FormSelector.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (18:4) {#each forms as form}
    function create_each_block(ctx) {
    	let button;
    	let t_value = /*form*/ ctx[4].label + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*form*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			toggle_class(button, "selected", /*activeForm*/ ctx[0] === /*form*/ ctx[4].id);
    			add_location(button, file$1, 18, 8, 574);
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
    				toggle_class(button, "selected", /*activeForm*/ ctx[0] === /*form*/ ctx[4].id);
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
    		source: "(18:4) {#each forms as form}",
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
    			add_location(h2, file$1, 14, 0, 481);
    			attr_dev(div0, "class", "button-group svelte-18wy25o");
    			add_location(div0, file$1, 16, 0, 513);
    			attr_dev(div1, "class", div1_class_value = "form-container " + (/*activeForm*/ ctx[0] === 1 ? 'active' : 'hidden') + " svelte-18wy25o");
    			add_location(div1, file$1, 27, 0, 767);
    			attr_dev(div2, "class", div2_class_value = "form-container " + (/*activeForm*/ ctx[0] === 2 ? 'active' : 'hidden') + " svelte-18wy25o");
    			add_location(div2, file$1, 30, 0, 863);
    			attr_dev(div3, "class", div3_class_value = "form-container " + (/*activeForm*/ ctx[0] === 3 ? 'active' : 'hidden') + " svelte-18wy25o");
    			add_location(div3, file$1, 33, 0, 964);
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
    			if (dirty & /*activeForm, forms, selectForm*/ 7) {
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

    			if (!current || dirty & /*activeForm*/ 1 && div1_class_value !== (div1_class_value = "form-container " + (/*activeForm*/ ctx[0] === 1 ? 'active' : 'hidden') + " svelte-18wy25o")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*activeForm*/ 1 && div2_class_value !== (div2_class_value = "form-container " + (/*activeForm*/ ctx[0] === 2 ? 'active' : 'hidden') + " svelte-18wy25o")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (!current || dirty & /*activeForm*/ 1 && div3_class_value !== (div3_class_value = "form-container " + (/*activeForm*/ ctx[0] === 3 ? 'active' : 'hidden') + " svelte-18wy25o")) {
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
    			component: "MotionForm.svelte"
    		},
    		{
    			id: 2,
    			label: "Proposition",
    			component: "PropositionForm.svelte"
    		},
    		{
    			id: 3,
    			label: "Handling",
    			component: "HandlingForm.svelte"
    		}
    	];

    	let { activeForm = 1 } = $$props;

    	function selectForm(id) {
    		$$invalidate(0, activeForm = id);
    	}

    	const writable_props = ['activeForm'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FormSelector> was created with unknown prop '${key}'`);
    	});

    	const click_handler = form => {
    		selectForm(form.id);
    	};

    	$$self.$$set = $$props => {
    		if ('activeForm' in $$props) $$invalidate(0, activeForm = $$props.activeForm);
    	};

    	$$self.$capture_state = () => ({
    		HandlingForm,
    		MotionForm,
    		PropositionForm,
    		forms,
    		activeForm,
    		selectForm
    	});

    	$$self.$inject_state = $$props => {
    		if ('activeForm' in $$props) $$invalidate(0, activeForm = $$props.activeForm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeForm, forms, selectForm, click_handler];
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
    	let button;
    	let t13;
    	let footer;
    	let p2;
    	let t15;
    	let p3;
    	let t16;
    	let a1;
    	let t18;
    	let t19;
    	let p4;
    	let current;
    	let mounted;
    	let dispose;
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
    			button = element("button");
    			button.textContent = "Generera dokument!";
    			t13 = space();
    			footer = element("footer");
    			p2 = element("p");
    			p2.textContent = "Skapad av: Alfred Grip och Ludvig Svedberg";
    			t15 = space();
    			p3 = element("p");
    			t16 = text("Tycker du det här verktyget är för simpelt? Saknas det något du\n\t\t\tbehöver? Testa skapa dokument med ");
    			a1 = element("a");
    			a1.textContent = "D-sektionens LaTeX-mallar";
    			t18 = text(" på egen hand!");
    			t19 = space();
    			p4 = element("p");
    			attr_dev(span, "id", "site-title-main");
    			set_style(span, "margin-left", "2px");
    			set_style(span, "margin-right", "-10px");
    			attr_dev(span, "class", "svelte-1fawg4f");
    			add_location(span, file, 9, 7, 245);
    			add_location(h1, file, 8, 3, 233);
    			attr_dev(p0, "id", "site-title-complement");
    			attr_dev(p0, "class", "svelte-1fawg4f");
    			add_location(p0, file, 14, 3, 357);
    			attr_dev(div0, "id", "site-title-container");
    			attr_dev(div0, "class", "svelte-1fawg4f");
    			add_location(div0, file, 7, 2, 198);
    			attr_dev(a0, "href", "https://github.com/alfredgrip/gerDa");
    			add_location(a0, file, 19, 37, 601);
    			add_location(p1, file, 16, 2, 420);
    			attr_dev(div1, "id", "outer-container");
    			attr_dev(div1, "class", "svelte-1fawg4f");
    			add_location(div1, file, 6, 1, 169);
    			add_location(hr, file, 24, 1, 683);
    			attr_dev(button, "class", "generate-button svelte-1fawg4f");
    			add_location(button, file, 26, 1, 709);
    			add_location(p2, file, 30, 2, 818);
    			attr_dev(a1, "href", "https://github.com/Dsek-LTH/dsek-latex");
    			add_location(a1, file, 33, 37, 978);
    			add_location(p3, file, 31, 2, 870);
    			add_location(p4, file, 38, 2, 1093);
    			attr_dev(footer, "id", "footer");
    			add_location(footer, file, 29, 1, 795);
    			attr_dev(main, "class", "svelte-1fawg4f");
    			add_location(main, file, 5, 0, 161);
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
    			append_dev(main, button);
    			append_dev(main, t13);
    			append_dev(main, footer);
    			append_dev(footer, p2);
    			append_dev(footer, t15);
    			append_dev(footer, p3);
    			append_dev(p3, t16);
    			append_dev(p3, a1);
    			append_dev(p3, t18);
    			append_dev(footer, t19);
    			append_dev(footer, p4);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
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
    			mounted = false;
    			dispose();
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

    const click_handler = () => {
    	
    };

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ FormSelector, onMount, activeForm: FormSelector });
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

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
