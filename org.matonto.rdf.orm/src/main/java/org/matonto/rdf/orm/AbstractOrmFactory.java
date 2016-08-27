package org.matonto.rdf.orm;

/*-
 * #%L
 * RDF ORM
 * $Id:$
 * $HeadURL:$
 * %%
 * Copyright (C) 2016 iNovex Information Systems, Inc.
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * #L%
 */

import aQute.bnd.annotation.component.Reference;
import org.matonto.rdf.api.Model;
import org.matonto.rdf.api.ModelFactory;
import org.matonto.rdf.api.Resource;
import org.matonto.rdf.api.Value;
import org.matonto.rdf.api.ValueFactory;
import org.matonto.rdf.orm.conversion.ValueConversionException;
import org.matonto.rdf.orm.conversion.ValueConverterRegistry;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;

/**
 * This is the abstract class for basic {@link OrmFactory} implementations. It
 * significantly reduces the amount of boiler plate code an {@link OrmFactory}
 * implementation will have to write.
 * 
 * @author bdgould
 *
 * @param <T>
 *            The type of ORM object this factory will work with
 */
public abstract class AbstractOrmFactory<T extends Thing> implements OrmFactory<T> {

	/**
	 * The {@link ValueFactory} we'll use for representing RDF data in this
	 * {@link OrmFactory} when one isn't provided to our objects.
	 */
	protected ValueFactory valueFactory;

	/**
	 * The {@link ModelFactory} we'll use for constructing {@link Model} objects
	 * when one isn't provided.
	 */
	protected ModelFactory modelFactory;

	/**
	 * The {@link ValueConverterRegistry} to use to convert {@link Value} data
	 * to objects when one isn't provided to our objects.
	 */
	protected ValueConverterRegistry valueConverterRegistry;

	/**
	 * The type of {@link Thing} this factory will construct/convert.
	 */
	protected final Class<T> type;

	/**
	 * The IRI string representing our type.
	 */
	protected final String typeIriString;

	/**
	 * The implementation of our type we'll build.
	 */
	protected final Class<? extends T> impl;

	/**
	 * The constructor to use to instantiate our type.
	 */
	private final Constructor<? extends T> implConstructor;

	/**
	 * Construct a new instance of an {@link AbstractOrmFactory}.
	 * Implementations will call this constructor.
	 * 
	 * @param type
	 *            The type we're building
	 * @param impl
	 *            The implementation under the covers
	 * @throws OrmException
	 *             If there is an issue constructing our {@link OrmFactory}
	 *             instance
	 */
	public AbstractOrmFactory(final Class<T> type, final Class<? extends T> impl) throws OrmException {
		this.type = type;
		this.impl = impl;
		this.typeIriString = getTypeIriString(type);
		try {
			this.implConstructor = impl.getConstructor(Resource.class, Model.class, ValueFactory.class,
					ValueConverterRegistry.class);
		} catch (NoSuchMethodException | SecurityException e) {
			throw new OrmException("Issue finding type constructor for " + impl.getName(), e);
		}
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public Class<T> getType() {
		return type;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public Class<? extends T> getImpl() {
		return impl;
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public T convertValue(Value value, Thing thing, Class<? extends T> desiredType) throws ValueConversionException {
		return getExisting((Resource) value, thing.getModel());
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public Value convertType(T type, Thing thing) throws ValueConversionException {
		return type.getResource();
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public T getExisting(Resource resource, Model model, ValueFactory valueFactory) {
		return getExisting(resource, model, valueFactory, this.valueConverterRegistry);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public T getExisting(Resource resource, Model model) {
		return getExisting(resource, model, this.valueFactory);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public T createNew(Resource resource, Model model, ValueFactory valueFactory,
			ValueConverterRegistry valueConverterRegistry) {
		model.add(valueFactory.createStatement(resource, valueFactory.createIRI(OrmFactory.RDF_TYPE_IRI),
				valueFactory.createLiteral(typeIriString)));
		return getExisting(resource, model, valueFactory, valueConverterRegistry);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public T createNew(Resource resource, Model model, ValueFactory valueFactory) {
		return createNew(resource, model, valueFactory, this.valueConverterRegistry);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public T createNew(Resource resource, Model model) {
		return createNew(resource, model, this.valueFactory, this.valueConverterRegistry);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public T createNew(Resource resource) {
		return createNew(resource, modelFactory.createModel(), this.valueFactory, this.valueConverterRegistry);
	}

	/**
	 * Set the {@link ModelFactory}. OSGi platform will inject this value.
	 * 
	 * @param modelFactory
	 *            The {@link ModelFactory} to use by default when the argument
	 *            isn't passed in
	 */
	@Reference
	public void setModelFactory(ModelFactory modelFactory) {
		this.modelFactory = modelFactory;
	}

	/**
	 * Set the {@link ValueFactory}. OSGi platform will inject this value.
	 * 
	 * @param valueFactory
	 *            The {@link ValueFactory} to use by default when the argument
	 *            isn't passed in
	 */
	@Reference
	public void setValueFactory(ValueFactory valueFactory) {
		this.valueFactory = valueFactory;
	}

	/**
	 * Set the {@link ValueConverterRegistry}. OSGi platform will inject this
	 * value.
	 * 
	 * @param valueConverterRegistry
	 *            The {@link ValueConverterRegistry} to use by default when the
	 *            argument isn't passed in
	 */
	@Reference
	public void setValueConverterRegistry(ValueConverterRegistry valueConverterRegistry) {
		this.valueConverterRegistry = valueConverterRegistry;
	}

	/**
	 * Construct an instance of our target implementation.
	 * 
	 * @param resource
	 *            The {@link Resource} identifying the instance
	 * @param valueFactory
	 *            The {@link ValueFactory} to use
	 * @param model
	 *            The backing {@link Model} to store the statements in
	 * @param valueConverterRegistry
	 *            The {@link ValueConverterRegistry} to use for our instance
	 * @return The new instance of our type
	 */
	protected T constructImpl(final Resource resource, ValueFactory valueFactory, Model model,
			final ValueConverterRegistry valueConverterRegistry) {
		try {
			return implConstructor.newInstance(resource, model, valueFactory, valueConverterRegistry);
		} catch (InstantiationException | IllegalAccessException | IllegalArgumentException
				| InvocationTargetException e) {
			throw new OrmException(
					"Issue constructing new instance of " + impl.getName() + " for ThingFactory of " + type.getName(),
					e);
		}
	}

	/**
	 * Get the type IRI string from the given interface type.
	 * 
	 * @param type
	 *            The interface {@link Thing} type to get the IRI string from
	 * @return The IRI String identifying the type of object for the passed in
	 *         type value
	 */
	private static String getTypeIriString(Class<?> type) {
		try {
			return type.getDeclaredField("TYPE").get(null).toString();
		} catch (IllegalArgumentException | IllegalAccessException | NoSuchFieldException | SecurityException e) {
			throw new OrmException("Issue getting type IRI for thing factory working with: " + type.getName(), e);
		}
	}

}