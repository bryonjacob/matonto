package org.matonto.vfs.basic;

/*-
 * #%L
 * org.matonto.vfs
 * $Id:$
 * $HeadURL:$
 * %%
 * Copyright (C) 2016 - 2017 iNovex Information Systems, Inc.
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

import aQute.bnd.annotation.component.Activate;
import aQute.bnd.annotation.component.Component;
import aQute.bnd.annotation.component.Deactivate;
import aQute.bnd.annotation.component.Modified;
import aQute.bnd.annotation.metatype.Configurable;
import org.apache.commons.vfs2.FileObject;
import org.apache.commons.vfs2.FileSystemException;
import org.apache.commons.vfs2.FileSystemManager;
import org.apache.commons.vfs2.VFS;
import org.matonto.vfs.api.TemporaryVirtualFile;
import org.matonto.vfs.api.VirtualFile;
import org.matonto.vfs.api.VirtualFilesystem;
import org.matonto.vfs.api.VirtualFilesystemException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.time.temporal.TemporalUnit;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * This is a basic implementation of the {@link VirtualFilesystem} backed by the commons-vfs api.
 */
@Component(
        name = BasicVirtualFilesystem.SERVICE_NAME,
        immediate = true,
        designateFactory = BasicVirtualFilesystemConfig.class
)
public class BasicVirtualFilesystem implements VirtualFilesystem {

    static final String SERVICE_NAME = "org.matonto.vfs.basic";

    private static final Logger LOGGER = LoggerFactory.getLogger(BasicVirtualFilesystem.class);

    private FileSystemManager fsManager;

    private ScheduledExecutorService scheduledExecutorService;

    private BlockingQueue<TemporaryVirtualFile> tempFiles;

    private String baseTempUrlTemplate;

    @Override
    public VirtualFile resolveVirtualFile(final URI uri) throws VirtualFilesystemException {
        try {
            return new BasicVirtualFile(this.fsManager.resolveFile(uri));
        } catch (FileSystemException e) {
            throw new VirtualFilesystemException("Issue resolving file with URI: " + uri.toString(), e);
        }
    }

    @Override
    public VirtualFile resolveVirtualFile(String uri) throws VirtualFilesystemException {
        try {
            return new BasicVirtualFile(this.fsManager.resolveFile(uri));
        } catch (FileSystemException e) {
            throw new VirtualFilesystemException("Issue resolving file with URI: " + uri, e);
        }
    }

    @Override
    public TemporaryVirtualFile createTemporaryVirtualFile(long timeToLive, TemporalUnit timeToLiveUnit) throws VirtualFilesystemException {
        final VirtualFile tmpDir = resolveVirtualFile(baseTempUrlTemplate);
        return createTemporaryVirtualFile(tmpDir, timeToLive, timeToLiveUnit);
    }

    @Override
    public TemporaryVirtualFile createTemporaryVirtualFile(VirtualFile directory, long timeToLive,
                                                           TemporalUnit timeToLiveUnit) throws VirtualFilesystemException {
        if (timeToLive > 0) {
            if (directory.isFolder()) {
                try {
                    final String id = directory.getIdentifier();
                    final FileObject obj = this.fsManager.resolveFile(id.endsWith("/") ? id : id + "/" + UUID.randomUUID() + "-" + System.currentTimeMillis());
                    final BasicTemporaryVirtualFile tvf = new BasicTemporaryVirtualFile(obj, timeToLive, timeToLiveUnit);
                    tempFiles.add(tvf);
                    return tvf;
                } catch (FileSystemException e) {
                    throw new VirtualFilesystemException("Issue creating temporary virtual file", e);
                }
            } else {
                throw new VirtualFilesystemException("Must specify a virtual directory to write the temp file in");
            }
        } else {
            throw new VirtualFilesystemException("Must specify a positive timeToLive duration (as opposed to " + timeToLive + ")");
        }
    }

    @Activate
    void activate(Map<String, Object> configuration) throws VirtualFilesystemException {
        BasicVirtualFilesystemConfig conf = Configurable.createConfigurable(BasicVirtualFilesystemConfig.class, configuration);
        try {
            this.fsManager = VFS.getManager();
        } catch (FileSystemException e) {
            throw new VirtualFilesystemException("Issue initializing virtual file system.", e);
        }
        //Set of queues.
        tempFiles = new ArrayBlockingQueue<TemporaryVirtualFile>(conf.maxNumberOfTempFiles());

        // Schedule our temp file cleanup service.
        this.scheduledExecutorService = Executors.newScheduledThreadPool(1);
        this.scheduledExecutorService.scheduleAtFixedRate(new CleanTempFilesRunnable(LOGGER, tempFiles),
                conf.secondsBetweenTempCleanup(), conf.secondsBetweenTempCleanup(), TimeUnit.SECONDS);
        LOGGER.debug("Configured scheduled cleanup of temp files to run every {} seconds", conf.secondsBetweenTempCleanup());

        //Set default temp url template
        this.baseTempUrlTemplate = conf.defaultTemporaryDirectory() != null ? conf.defaultTemporaryDirectory() : ("file://" + System.getProperty("java.io.tmpdir"));
        LOGGER.debug("Going to use {} for our base temp directory template", this.baseTempUrlTemplate);
    }

    @Modified
    void modified(Map<String, Object> configuration) throws VirtualFilesystemException {
        deactivate();
        activate(configuration);
    }


    @Deactivate
    void deactivate() {
        this.fsManager = null;
        new CleanTempFilesRunnable(LOGGER, tempFiles).run();
        if (this.scheduledExecutorService != null) {
            this.scheduledExecutorService.shutdownNow();
        }
        LOGGER.debug("Deactivated Basic Virtual Filesystem service");
    }
}
